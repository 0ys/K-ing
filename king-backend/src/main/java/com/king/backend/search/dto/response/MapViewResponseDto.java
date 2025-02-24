package com.king.backend.search.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 지도 보기 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapViewResponseDto {
    private List<PlaceDto> places;
    private long total;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceDto {
        private Long placeId;
        private String name;
        private String type;
        private String openHour;
        private String breakTime;
        private String closedDay;
        private String address;
        private double lat;
        private double lng;
    }
}
