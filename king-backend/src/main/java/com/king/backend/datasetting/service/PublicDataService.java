package com.king.backend.datasetting.service;

import com.king.backend.datasetting.config.AppProperties;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.entity.PlaceCast;
import com.king.backend.domain.place.entity.PlaceContent;
import com.king.backend.domain.place.repository.PlaceCastRepository;
import com.king.backend.domain.place.repository.PlaceContentRepository;
import com.king.backend.domain.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PublicDataService {
    private final AppProperties appProperties;
    private final PlaceRepository placeRepository;
    private final ContentRepository contentRepository;
    private final CastRepository castRepository;
    private final PlaceContentRepository placeContentRepository;
    private final PlaceCastRepository placeCastRepository;
    private final RestTemplate restTemplate;

    private final LevenshteinDistance levenshtein = new LevenshteinDistance();

    private static final long API_CALL_DELAY_MS = 200; // 200밀리초 지연

    /**
     * 외부 공공 데이터 API를 호출하여 JSON 데이터를 파싱하고 DB에 저장(Upsert)하는 메서드
     * Autocomplete + Place Search 조합을 통해 이미지 URL을 함께 조회하여 DB에 저장합니다.
     * - 장소 정보는 반드시 저장
     * - 미디어타입이 drama, show, movie 인 경우 content 테이블에 제목 등 저장
     * - 미디어타입이 artist 인 경우 cast 테이블에 이름만 저장
     *
     * 응답 JSON 예시:
     * {
     *   "currentCount": 10,
     *   "data": [ ... ],
     *   "matchCount": 15034,
     *   "page": 1,
     *   "perPage": 10,
     *   "totalCount": 15034
     * }
     */
    public List<Place> fetchAndSaveAllPublicData() {
        List<Place> savedPlaces = new ArrayList<>();
        String apiUrl = appProperties.getPublicApi().getUrl();
        String key = appProperties.getPublicApi().getKey();

        // 한 페이지 당 가져올 데이터 수 설정 (API 문서에서 최대 허용값 확인)
        int perPage = 10;
        int currentPage = 1;
        int totalPages = 1; // 첫번째 호출 이후에 업데이트

        // 저장 성공한 건수를 누적할 변수 선언
        int successCount = 0;

        try {
            do {
                // page, perPage, serviceKey 등 필요한 파라미터를 모두 포함하여 요청 URL 구성
                String requestUrl = apiUrl + "?page=" + currentPage + "&perPage=" + perPage + "&serviceKey=" + key;

                ResponseEntity<Map> response = restTemplate.getForEntity(requestUrl, Map.class);
                Map responseBody = response.getBody();

                // 첫 페이지 호출 시 전체 데이터 수를 이용해 전체 페이지 수 계산
                if (currentPage == 1 && responseBody.get("totalCount") != null) {
                    int totalCount = Integer.parseInt(responseBody.get("totalCount").toString());
                    totalPages = (int) Math.ceil((double) totalCount / perPage);
                }

                // 응답의 실제 데이터는 "data" 키에 배열 형태로 들어있다고 가정
                List<Map<String, Object>> records = (List<Map<String, Object>>) responseBody.get("data");
                if (records != null) {
                    for (Map<String, Object> record : records) {
                        // 공통: 장소 관련 데이터 파싱
                        String name = (String) record.get("장소명");
                        String type = (String) record.get("장소타입");
                        String address = (String) record.get("주소");
                        String phone = (String) record.get("전화번호");
                        String openHour = (String) record.get("영업시간");
                        String breakTime = (String) record.get("브레이크타임");
                        String closedDay = (String) record.get("휴무일");
                        String description = (String) record.get("장소설명");
                        String mediaType = Optional.ofNullable((String) record.get("미디어타입")).orElse("").toLowerCase();

                        Double lat = parseDouble(record.get("위도"));
                        Double lng = parseDouble(record.get("경도"));

                        // 중복 체크 : 장소명과 주소 기준
                        Place place = placeRepository.findByNameAndAddress(name, address)
                                .orElseGet(Place::new);
                        place.setName(name);
                        place.setType(type);
                        place.setAddress(address);
                        place.setPhone(phone);
                        place.setOpenHour(openHour);
                        place.setBreakTime(breakTime);
                        place.setClosedDay(closedDay);
                        place.setDescription(description);
                        place.setLat(lat.floatValue());
                        place.setLng(lng.floatValue());

                        // Autocomplete → Nearby Search → Place Search 조합을 통해 imageUrl 획득
                        String imageUrl = getImageUrlUsingCombinedStrategy(place);

                        place.setImageUrl(imageUrl);

                        place.setView(0L);

                        placeRepository.save(place);

                        // 저장 성공 시 successCount 증가
                        successCount++;

                        // 미디어타입에 따른 추가 처리
                        if (Arrays.asList("movie", "show", "drama").contains(mediaType)) {
                            String title = (String) record.get("제목");
                            if (title != null && !title.isEmpty()) {
                                Content content = searchAndMatchContent(title);
                                if (content != null) {
                                    // Create or find PlaceContent link
                                    Optional<PlaceContent> existingLink = placeContentRepository.findByPlaceAndContent(place, content);
                                    if (!existingLink.isPresent()) {
                                        PlaceContent placeContent = new PlaceContent();
                                        placeContent.setPlace(place);
                                        placeContent.setContent(content);
                                        placeContent.setDescription(description);
                                        placeContentRepository.save(placeContent);
                                        System.out.println("Linked Place ["+place.getName()+"] with Content ["+content.getTranslationKo().getTitle()+"]");
                                    } else {
                                        System.out.println("Link between Place ["+place.getName()+"] and Content ["+content.getTranslationKo().getTitle()+"] already exists");
                                    }
                                } else {
                                    System.out.println("No matching Content found for title ["+title+"], Place ["+place.getName()+"]");
                                }
                            } else {
                                System.out.println("Title is missing for mediaType ["+mediaType+"], Place ["+place.getName()+"]");
                            }
                        } else if ("artist".equals(mediaType)) {
                            String nameMedia = (String) record.get("제목"); // Assuming '제목' holds the artist name
                            if (nameMedia != null && !nameMedia.isEmpty()) {
                                List<Cast> matchedCasts = searchAndMatchCast(nameMedia);
                                if (matchedCasts.isEmpty()) {
                                    System.out.println("No matching Cast found for name ["+nameMedia+"]");
                                }
                                for (Cast cast : matchedCasts) {
                                    // Create or find PlaceCast link
                                    Optional<PlaceCast> existingLink = placeCastRepository.findByPlaceAndCast(place, cast);
                                    if (!existingLink.isPresent()) {
                                        PlaceCast placeCast = new PlaceCast();
                                        placeCast.setPlace(place);
                                        placeCast.setCast(cast);
                                        placeCast.setDescription(description);
                                        placeCastRepository.save(placeCast);
                                        System.out.println("Linked Place ["+place.getName()+"] with Cast ["+cast.getTranslationKo().getName()+"]");
                                    } else {
                                        System.out.println("Link between Place ["+place.getName()+"] and Cast ["+cast.getTranslationKo().getName()+"] already exists");
                                    }
                                }
                            } else {
                                System.out.println("Artist name is missing for mediaType ["+mediaType+"], Place ["+place.getName()+"]");
                            }
                        }
                        savedPlaces.add(place);
                    }
                }
                // 페이지 단위로 누적 건수 출력(원하면 각 페이지별로 출력 가능)
                System.out.println("현재까지 저장된 건수: " + successCount);

                currentPage++;
            } while (currentPage <= totalPages);
        } catch (Exception e) {
            System.err.println("Error fetching public data: " + e.getMessage());
        }
        return savedPlaces;
    }

    /**
     * TMDB에서 Content를 검색하고 가장 유사한 Content를 반환합니다.
     *
     * @param title 검색할 제목
     * @return 가장 유사한 Content 또는 null
     */
    private Content searchAndMatchContent(String title) {

        // 정확히 일치하는 제목을 먼저 검색
        Optional<Content> exactMatch = contentRepository.findByTitle(title);
        if (exactMatch.isPresent()) {
            return exactMatch.get();
        }

        // 정확한 일치가 없으면 유사한 제목을 검색
        List<Content> partialMatches = contentRepository.findByTitleContainingIgnoreCase(title);
        Content bestMatch = null;
        int highestSimilarity = 0;
        for (Content content : partialMatches) {
            int similarity = calculateSimilarity(title, content.getTranslationKo().getTitle());
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = content;
            }
        }

        if (bestMatch != null && highestSimilarity >= 70) { // 유사도 기준 70%
            return bestMatch;
        }

        // 유사한 Content를 찾지 못함
        return null;
    }

    /**
     * 두 문자열 간의 유사도를 퍼센트로 계산합니다.
     *
     * @param s1 첫 번째 문자열
     * @param s2 두 번째 문자열
     * @return 유사도 퍼센트
     */
    private int calculateSimilarity(String s1, String s2) {
        int distance = levenshtein.apply(s1.toLowerCase(), s2.toLowerCase());
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 100;
        return (int) (((double) (maxLen - distance) / maxLen) * 100);
    }


    /**
     * 인물명을 기반으로 TMDB API에서 Cast를 검색하고 적합한 Cast 리스트를 반환합니다.
     *
     * @param name 검색할 인물명
     * @return 매칭된 Cast 리스트
     */
    private List<Cast> searchAndMatchCast(String name) {
        List<Cast> matchedCasts = new ArrayList<>();
        String baseUrl = appProperties.getTmdbApi().getBaseUrl();
        String apiKey = appProperties.getTmdbApi().getKey();

        try {
            // API 호출 전 지연
            Thread.sleep(API_CALL_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println("Interrupted during API call delay: "+e);
            return matchedCasts;
        }

        try {
            // TMDB 인물 검색 API 사용
            String searchUrl = baseUrl + "/search/person?api_key=" + apiKey
                    + "&language=ko&query=" + URLEncoder.encode(name, StandardCharsets.UTF_8.toString());
            ResponseEntity<Map> response = restTemplate.getForEntity(searchUrl, Map.class);
            Map<String, Object> body = response.getBody();

            if (body == null) {
                System.out.println("Response body is null for searchCast with name "+name);
                return matchedCasts;
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
            if (results != null && !results.isEmpty()) {
                for (Map<String, Object> result : results) {
                    String personId = String.valueOf(result.get("id"));
                    String personName = (String) result.get("name");

                    // 상세 정보 API 호출하여 also_known_as 리스트 가져오기
                    List<String> alsoKnownAs = getAlsoKnownAs(personId);
                    if (alsoKnownAs == null) {
                        alsoKnownAs = Collections.emptyList();
                    }

                    // 이름과 also_known_as 리스트 비교
                    boolean isMatch = false;
                    if (personName.equalsIgnoreCase(name)) {
                        isMatch = true;
                    } else {
                        for (String alias : alsoKnownAs) {
                            if (alias.equalsIgnoreCase(name)) {
                                isMatch = true;
                                break;
                            }
                        }
                    }

                    if (isMatch) {
                        Optional<Cast> castOpt = castRepository.findByTmdbId(Integer.valueOf(personId));
                        castOpt.ifPresent(matchedCasts::add);
                        System.out.println("Matched Cast found: "+ personName);
                    }
                }
            } else {
                System.out.println("No results found in cast search for name "+ name);
            }

        } catch (Exception e) {
            System.out.println("Error searching cast for name '"+name+"': "+ e.getMessage());
        }

        return matchedCasts;
    }

    /**
     * person_id를 사용하여 TMDB에서 상세 정보를 가져오고 also_known_as 리스트를 반환합니다.
     *
     * @param personId TMDB person ID
     * @return also_known_as 리스트 또는 null
     */
    private List<String> getAlsoKnownAs(String personId) {
        String baseUrl = appProperties.getTmdbApi().getBaseUrl();
        String apiKey = appProperties.getTmdbApi().getKey();

        try {
            String detailsUrl = baseUrl + "/person/" + personId
                    + "?api_key=" + apiKey
                    + "&language=ko";

            ResponseEntity<Map> response = restTemplate.getForEntity(detailsUrl, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && body.containsKey("also_known_as")) {
                return (List<String>) body.get("also_known_as");
            } else {
                System.out.println("No also_known_as found for person ID "+personId);
            }
        } catch (Exception e) {
            System.out.println("Error fetching details for person ID '"+personId+"': "+e.getMessage());
        }

        return null;
    }

    /**
     * Autocomplete → Nearby Search → Place Search의 단계별 전략을 통해 최종 place_id를 결정하고,
     * 해당 place_id를 사용해 Place Details API에서 사진 정보를 가져와 최종 이미지 URL을 구성합니다.
     */
    private String getImageUrlUsingCombinedStrategy(Place place) {
        String placeId = getPlaceIdFromAutocompleteName(place);
        if (placeId == null) {
            placeId = getPlaceIdFromAutocompleteAddress(place);
        }
        if (placeId == null) {
            placeId = getPlaceIdUsingNearbySearch(place);
        }
        if (placeId == null) {
            placeId = getPlaceIdFromPlaceSearchName(place);
        }
        if (placeId == null) {
            placeId = getPlaceIdFromPlaceSearchAddress(place);
        }
        if (placeId == null) {
            return null;
        }
        return getPhotoUrlFromPlaceId(placeId);
    }

    // --- Autocomplete 단계 ---
    /**
     * 1-1: Autocomplete API로 장소명으로 검색하여 place_id 획득
     */
    private String getPlaceIdFromAutocompleteName(Place place) {
        try {
            String query = place.getName();
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String autoUrl = appProperties.getGoogleApi().getAutocompleteUrl()
                    + "?input=" + encodedQuery
                    + "&key=" + appProperties.getGoogleApi().getKey();
            ResponseEntity<Map> response = restTemplate.getForEntity(autoUrl, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("predictions")) {
                List<Map<String, Object>> predictions = (List<Map<String, Object>>) body.get("predictions");
                if (!predictions.isEmpty()) {
                    // 첫 번째 결과의 place_id 반환
                    return (String) predictions.get(0).get("place_id");
                }
            }
        } catch (Exception e) {
            System.err.println("Autocomplete(장소명) 오류 (" + place.getName() + "): " + e.getMessage());
        }
        return null;
    }

    /**
     * 1-2: Autocomplete API로 주소로 검색하여 place_id 획득
     */
    private String getPlaceIdFromAutocompleteAddress(Place place) {
        try {
            String query = place.getAddress();
            if (query == null || query.isEmpty()) return null;
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String autoUrl = appProperties.getGoogleApi().getAutocompleteUrl()
                    + "?input=" + encodedQuery
                    + "&key=" + appProperties.getGoogleApi().getKey();
            ResponseEntity<Map> response = restTemplate.getForEntity(autoUrl, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("predictions")) {
                List<Map<String, Object>> predictions = (List<Map<String, Object>>) body.get("predictions");
                if (!predictions.isEmpty()) {
                    return (String) predictions.get(0).get("place_id");
                }
            }
        } catch (Exception e) {
            System.err.println("Autocomplete(주소) 오류 (" + place.getAddress() + "): " + e.getMessage());
        }
        return null;
    }

    // --- Nearby Search 단계 ---
    /**
     * Step 2: Nearby Search API를 사용하여 위도/경도 기준으로 주변 장소 검색 후,
     * 결과 중 첫 번째의 place_id를 반환
     */
    private String getPlaceIdUsingNearbySearch(Place place) {
        try {
            String location = place.getLat() + "," + place.getLng();
            String radius = "500"; // 500 미터 반경 (필요에 따라 조정)
            String nearbyUrl = appProperties.getGoogleApi().getNearbyUrl()
                    + "?location=" + location
                    + "&radius=" + radius
                    + "&key=" + appProperties.getGoogleApi().getKey();
            ResponseEntity<Map> response = restTemplate.getForEntity(nearbyUrl, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                if (!results.isEmpty()) {
                    return (String) results.get(0).get("place_id");
                }
            }
        } catch (Exception e) {
            System.err.println("Nearby Search 오류 (" + place.getName() + "): " + e.getMessage());
        }
        return null;
    }

    // --- Place Search 단계 (Fallback) ---
    /**
     * 3-1: Place Search API로 장소명 기준 검색 후, 첫 번째 결과의 place_id 반환
     */
    private String getPlaceIdFromPlaceSearchName(Place place) {
        try {
            String query = place.getName();
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String searchUrl = appProperties.getGoogleApi().getSearchUrl()
                    + "?query=" + encodedQuery
                    + "&key=" + appProperties.getGoogleApi().getKey();
            ResponseEntity<Map> response = restTemplate.getForEntity(searchUrl, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                if (!results.isEmpty()) {
                    return (String) results.get(0).get("place_id");
                }
            }
        } catch (Exception e) {
            System.err.println("Place Search(장소명) 오류 (" + place.getName() + "): " + e.getMessage());
        }
        return null;
    }

    /**
     * 3-2: Place Search API로 주소 기준 검색 후, 첫 번째 결과의 place_id 반환
     */
    private String getPlaceIdFromPlaceSearchAddress(Place place) {
        try {
            String query = place.getAddress();
            if (query == null || query.isEmpty()) return null;
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String searchUrl = appProperties.getGoogleApi().getSearchUrl()
                    + "?query=" + encodedQuery
                    + "&key=" + appProperties.getGoogleApi().getKey();
            ResponseEntity<Map> response = restTemplate.getForEntity(searchUrl, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                if (!results.isEmpty()) {
                    return (String) results.get(0).get("place_id");
                }
            }
        } catch (Exception e) {
            System.err.println("Place Search(주소) 오류 (" + place.getAddress() + "): " + e.getMessage());
        }
        return null;
    }

    // --- 최종 단계: Place Details -> Place Photo URL ---
    /**
     * 최종적으로 결정된 place_id를 이용해 Place Details API를 호출하여 photos 배열의
     * 첫 번째 결과에서 photo_reference를 얻고, 이를 바탕으로 Place Photos API URL을 구성하여 반환합니다.
     */
    private String getPhotoUrlFromPlaceId(String placeId) {
        try {
            String detailsUrl = appProperties.getGoogleApi().getDetailsUrl()
                    + "?place_id=" + placeId
                    + "&fields=photos"
                    + "&key=" + appProperties.getGoogleApi().getKey();
            ResponseEntity<Map> response = restTemplate.getForEntity(detailsUrl, Map.class);
            Map body = response.getBody();
            if (body == null || !body.containsKey("result")) {
                System.err.println("Place Details 결과 없음: " + placeId);
                return null;
            }
            Map result = (Map) body.get("result");
            List<Map<String, Object>> photos = (List<Map<String, Object>>) result.get("photos");
            if (photos == null || photos.isEmpty()) {
                System.err.println("사진 정보 없음: " + placeId);
                return null;
            }
            String photoReference = (String) photos.get(0).get("photo_reference");
            if (photoReference == null) {
                System.err.println("photo_reference 없음: " + placeId);
                return null;
            }
            String photoUrl = appProperties.getGoogleApi().getPhotosUrl()
                    + "?maxwidth=400"
                    + "&photoreference=" + photoReference
                    + "&key=" + appProperties.getGoogleApi().getKey();
            return photoUrl;
        } catch (Exception e) {
            System.err.println("오류 in getPhotoUrlFromPlaceId (" + placeId + "): " + e.getMessage());
            return null;
        }
    }

    private Double parseDouble(Object value) {
        try {
            return value != null ? Double.parseDouble(value.toString()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

