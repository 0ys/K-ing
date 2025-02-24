package com.king.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// ES 검색 결과 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceSearchResponseDto {
    private List<PlaceResult> places;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceResult {
        private Long placeId;
        private String name;
        private String type;
        private String address;
        private String relatedName;
        private String description;
        private Double lat;
        private Double lng;
        private String imageUrl;
    }
}
