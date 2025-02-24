package com.king.backend.search.util;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.search.entity.SearchDocument;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import java.util.List;
import java.util.stream.Collectors;

public class SearchDocumentBuilder {

    /**
     * Cast 객체를 SearchDocument로 변환합니다.
     *
     * @param cast 도메인 Cast 객체
     * @return 변환된 SearchDocument
     */
    public static SearchDocument fromCast(Cast cast) {
        return new SearchDocument(
                "CAST-" + cast.getId(),
                "CAST",
                "N/A",
                cast.getTranslationKo().getName(),
                "가수, 인물",
                cast.getImageUrl(),
                cast.getId(),
                0,
                cast.getCreatedAt(),
                "N/A", "N/A", "N/A", "N/A",
                null,
                null, null
        );
    }

    /**
     * Content 객체를 SearchDocument로 변환합니다.
     *
     * @param content 도메인 Content 객체
     * @return 변환된 SearchDocument
     */
    public static SearchDocument fromContent(Content content) {
        return new SearchDocument(
                "CONTENT-" + content.getId(),
                content.getType().toUpperCase(),
                content.getType().toUpperCase(), // type 필드
                content.getTranslationKo().getTitle(),
                content.getTranslationKo().getDescription(),
                content.getImageUrl(),
                content.getId(),
                0,
                content.getCreatedAt(),
                "N/A", "N/A", "N/A", "N/A",
                null,
                null, null
        );
    }

    /**
     * Place 객체를 SearchDocument로 변환합니다.
     *
     * @param place 도메인 Place 객체
     * @param viewCount Redis에서 가져온 조회수
     * @return 변환된 SearchDocument
     */
    public static SearchDocument fromPlace(Place place, int viewCount) {
        List<SearchDocument.AssociatedCast> associatedCasts = (place.getPlaceCasts() == null) ? List.of() :
                place.getPlaceCasts().stream()
                        .map(pc -> new SearchDocument.AssociatedCast(
                                pc.getCast().getTranslationKo().getName(),
                                pc.getDescription() == null ? "" : pc.getDescription()
                        ))
                        .collect(Collectors.toList());
        // 연결된 컨텐츠 정보를 nested 객체 리스트로 생성
        List<SearchDocument.AssociatedContent> associatedContents = (place.getPlaceContents() == null) ? List.of() :
                place.getPlaceContents().stream()
                        .map(pc -> new SearchDocument.AssociatedContent(
                                pc.getContent().getTranslationKo().getTitle(),
                                pc.getDescription() == null ? "" : pc.getDescription()
                        ))
                        .collect(Collectors.toList());
        return new SearchDocument(
                "PLACE-" + place.getId(),
                "PLACE",
                place.getType().toUpperCase(),
                place.getName(),
                place.getDescription(),
                place.getImageUrl(),
                place.getId(),
                viewCount,
                place.getCreatedAt(),
                place.getOpenHour(),
                place.getBreakTime(),
                place.getClosedDay(),
                place.getAddress(),
                new GeoPoint(place.getLat(), place.getLng()),
                associatedCasts,
                associatedContents
        );
    }
}
