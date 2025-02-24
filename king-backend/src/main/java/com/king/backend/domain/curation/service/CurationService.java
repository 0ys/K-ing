package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.CurationQueryRequestDTO;
import com.king.backend.domain.curation.dto.request.CurationRequestDTO;
import com.king.backend.domain.curation.dto.response.CurationDetailResponseDTO;
import com.king.backend.domain.curation.dto.response.CurationListResponseDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListBookmark;
import com.king.backend.domain.curation.entity.CurationListItem;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListItemRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.domain.place.service.GooglePhotoService;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.translate.TranslateService;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.global.util.ValidationUtil;
import com.king.backend.s3.service.S3Service;
import com.king.backend.search.util.CursorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class CurationService {
    private final CursorUtil cursorUtil;
    private final CurationListRepository curationListRepository;
    private final CurationListBookmarkRepository curationListBookmarkRepository;
    private final CurationListItemRepository curationListItemRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final PlaceRepository placeRepository;
    private final TranslateService translateService;
    private final RedisUtil redisUtil;
    private final GooglePhotoService googlePhotoService;

    @Transactional(readOnly = true)
    public Long getCurationIdByTitle(String title) {
        List<CurationList> candidates = curationListRepository.findByTitleLike(title);

        if (candidates.isEmpty()) {
            throw new CustomException(CurationErrorCode.CURATION_NOT_FOUND);
        }

        // 1. 입력값 띄어쓰기 제거
        String sanitizedInput = title.replaceAll("\\s+", "");

        // 2. 가장 유사한 제목 찾기 (Levenshtein Distance)
        LevenshteinDistance levenshtein = new LevenshteinDistance();
        CurationList bestMatch = null;
        int minDistance = Integer.MAX_VALUE;

        for (CurationList curation : candidates) {
            String sanitizedDbTitle = curation.getTitle().replaceAll("\\s+", ""); // DB 값 띄어쓰기 제거
            int distance = levenshtein.apply(sanitizedInput, sanitizedDbTitle);

            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = curation;
            } else if (distance == minDistance) {
                // 유사도가 같다면 최신 데이터 선택 (예: createdAt 기준)
                if (bestMatch == null || curation.getCreatedAt().isAfter(bestMatch.getCreatedAt())) {
                    bestMatch = curation;
                }
            }
        }

        return bestMatch.getId();
    }

    @Transactional
    public CurationDetailResponseDTO getCurationDetail(Long curationListId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(user.getName());
        String language = user.getLanguage();

        CurationList curationList = curationListRepository.findById(curationListId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curationList.isPublic() && !curationList.getWriter().getId().equals(userId)) {
            throw new CustomException(CurationErrorCode.CURATION_NOT_FOUND);
        }

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curationListId, userId);

        List<Place> places = curationListItemRepository.findByCurationListId(curationListId)
                .stream()
                .map(CurationListItem::getPlace)
                .peek((place) -> {
                    String imageUrl = place.getImageUrl() == null ? "https://d1qaf0hhk6y1ff.cloudfront.net/uploads/default.jpg" : googlePhotoService.getRedirectedImageUrl(place.getImageUrl());

                    place.setImageUrl(imageUrl);
                    placeRepository.save(place);
                }).toList();

        CurationDetailResponseDTO response = CurationDetailResponseDTO.fromEntity(curationList, bookmarked, places);

        Map<String, String> originalText = new HashMap<>();

        String titleKey = "curation:" + curationList.getId() + ":" + language + ":title";
        String descriptionKey = "curation:" + curationList.getId() + ":" + language + ":description";

        originalText.put(titleKey, response.getTitle());
        originalText.put(descriptionKey, response.getDescription());

        Map<String, String> translatedText = translateService.getTranslatedText(originalText, language);

        response.setTitle(translatedText.get(titleKey));
        response.setDescription(translatedText.get(descriptionKey));

        return response;
    }

    @Transactional
    public CurationListResponseDTO getCurations(CurationQueryRequestDTO requestDTO) {
        Long userId = requestDTO.getUserId();
        int size = Optional.ofNullable(requestDTO.getSize()).orElse(10);

        String cursor = requestDTO.getCursor();
        Long cursorId = (cursor != null) ? Long.parseLong(cursorUtil.decodeCursor(cursor).get(0).toString()) : null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long authId = Long.parseLong(authUser.getName());
        String language = authUser.getLanguage();

        boolean bookmarked = Optional.ofNullable(requestDTO.getBookmarked()).orElse(false);

        String nextCursor;
        Map<String, String> originalText;
        List<String> keys = new ArrayList<>();
        List<CurationListResponseDTO.CurationDTO.CurationDTOBuilder> builders;

        if (bookmarked) {
            List<CurationListBookmark> bookmarks = curationListBookmarkRepository.findByUserId(authId, cursorId, size);

            originalText = new HashMap<>();
            builders =
                    bookmarks.stream()
                            .map((bookmark) -> {
                                CurationList curationList = bookmark.getCurationList();

                                String key = "curation:" + curationList.getId() + ":" + language + ":title";
                                originalText.put(key, curationList.getTitle());
                                keys.add(key);

                                return CurationListResponseDTO.CurationDTO.builder()
                                        .curationId(curationList.getId())
                                        .imageUrl(curationList.getImageUrl())
                                        .writerNickname(curationList.getWriter().getNickname())
                                        .isPublic(curationList.isPublic())
                                        .bookmarked(true);
                            }).toList();

            nextCursor = (builders.size() == size)
                    ? cursorUtil.encodeCursor(List.of(bookmarks.get(bookmarks.size() - 1).getId()))
                    : null;
        } else {
            List<Object[]> results = curationListRepository.findCurationList(authId, userId, cursorId, size);

            originalText = new HashMap<>();
            builders = results.stream()
                    .map((result) -> {
                        CurationList curationList = (CurationList) result[0];
                        boolean userBookmark = (boolean) result[1];
                        log.info("{}, {}", curationList, userBookmark);

                        String key = "curation:" + curationList.getId() + ":" + language + ":title";
                        originalText.put(key, curationList.getTitle());
                        keys.add(key);

                        return CurationListResponseDTO.CurationDTO.builder()
                                .curationId(curationList.getId())
                                .imageUrl(curationList.getImageUrl())
                                .writerNickname(curationList.getWriter().getNickname())
                                .isPublic(curationList.isPublic())
                                .bookmarked(userBookmark);
                    }).toList();

            nextCursor = (builders.size() == size)
                    ? cursorUtil.encodeCursor(List.of(((CurationList) results.get(results.size() - 1)[0]).getId()))
                    : null;
        }

        Map<String, String> translatedText = translateService.getTranslatedText(originalText, language);

        List<CurationListResponseDTO.CurationDTO> curations = new ArrayList<>();
        for (int i = 0; i < builders.size(); i++) {
            curations.add(builders.get(i).title(translatedText.get(keys.get(i))).build());
        }

        return CurationListResponseDTO.builder()
                .curations(curations)
                .nextCursor(nextCursor)
                .build();
    }

    @Transactional
    public CurationDetailResponseDTO postCuration(CurationRequestDTO requestDTO, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if (!ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getTitle(), 50)
                || !ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getDescription(), 1000)
                || requestDTO.getPlaceIds().isEmpty()) {
            throw new CustomException(CurationErrorCode.INVALID_VALUE);
        }

        CurationList curation = new CurationList();
        String imageUrl = s3Service.uploadFile(curation, imageFile);
        curation.setTitle(requestDTO.getTitle());
        curation.setDescription(requestDTO.getDescription());
        curation.setPublic(requestDTO.isPublic());
        curation.setImageUrl(imageUrl);
        curation.setWriter(user);
        curation.setCreatedAt(OffsetDateTime.now());

        curationListRepository.save(curation);

        for (Long placeId : requestDTO.getPlaceIds()) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

            curationListItemRepository.findByCurationListAndPlace(curation, place)
                    .ifPresent((item) -> {
                        throw new CustomException(CurationErrorCode.DUPLICATED_PLACE);
                    });

            CurationListItem curationListItem = new CurationListItem();
            curationListItem.setCurationList(curation);
            curationListItem.setPlace(place);

            curationListItemRepository.save(curationListItem);
        }

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curation.getId(), userId);

        List<Place> places = curationListItemRepository.findByCurationListId(curation.getId())
                .stream()
                .map(CurationListItem::getPlace)
                .toList();

        return CurationDetailResponseDTO.fromEntity(curation, bookmarked, places);
    }

    @Transactional
    public CurationDetailResponseDTO putCuration(Long curationId, CurationRequestDTO requestDTO, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        String language = authUser.getLanguage();
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        CurationList curation = curationListRepository.findById(curationId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curation.getWriter().equals(user)) {
            throw new CustomException(CurationErrorCode.FORBIDDEN_CURATION);
        }

        if (!ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getTitle(), 50)
                || !ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getDescription(), 1000)
                || requestDTO.getPlaceIds().isEmpty()) {
            throw new CustomException(CurationErrorCode.INVALID_VALUE);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.uploadFile(curation, imageFile);
            curation.setImageUrl(imageUrl);
        }
        curation.setTitle(requestDTO.getTitle());
        curation.setDescription(requestDTO.getDescription());
        curation.setPublic(requestDTO.isPublic());

        curationListRepository.save(curation);

        curationListItemRepository.deleteAllByCurationList(curation);

        for (Long placeId : requestDTO.getPlaceIds()) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

            curationListItemRepository.findByCurationListAndPlace(curation, place)
                    .ifPresent((item) -> {
                        throw new CustomException(CurationErrorCode.DUPLICATED_PLACE);
                    });

            CurationListItem curationListItem = new CurationListItem();
            curationListItem.setCurationList(curation);
            curationListItem.setPlace(place);

            curationListItemRepository.save(curationListItem);
        }

        String baseKey = "curation:" + curation.getId() + ":" + language;
        redisUtil.deleteValue(baseKey + ":title");
        redisUtil.deleteValue(baseKey + ":description");

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curation.getId(), userId);

        List<Place> places = curationListItemRepository.findByCurationListId(curation.getId())
                .stream()
                .map(CurationListItem::getPlace)
                .toList();

        return CurationDetailResponseDTO.fromEntity(curation, bookmarked, places);
    }

    @Transactional
    public void deleteCuration(Long curationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        CurationList curation = curationListRepository.findById(curationId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curation.getWriter().equals(user)) {
            throw new CustomException(CurationErrorCode.FORBIDDEN_CURATION);
        }

        curationListBookmarkRepository.deleteAllByCurationList(curation);
        curationListItemRepository.deleteAllByCurationList(curation);
        curationListRepository.delete(curation);
    }
}
