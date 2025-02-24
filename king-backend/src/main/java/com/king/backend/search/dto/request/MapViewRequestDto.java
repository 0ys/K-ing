package com.king.backend.search.dto.request;

import lombok.*;

import java.util.List;

/**
 * 지도 보기 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapViewRequestDto {
    private String query;
    private String relatedType;
    private String sortBy;
    private String sortOrder;
    private List<String> placeTypeList;
    private String region;
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
