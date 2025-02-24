package com.king.backend.search.dto.request;

import lombok.*;

import java.util.List;

/**
 * 검색 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequestDto {
    private String query;
    private String category;

    private String relatedType;

    private int size = 10;

    private String sortBy;
    private String sortOrder;

    private List<String> placeTypeList;
    private String region;

    private String cursor;

    private BoundingBox boundingBox;

    /**
     * 지도 영역의 Bounding Box를 나타내는 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Setter
    @Getter
    public static class BoundingBox {
        private double swLat; // 남서쪽 위도
        private double swLng; // 남서쪽 경도
        private double neLat; // 북동쪽 위도
        private double neLng; // 북동쪽 경도
    }
}
