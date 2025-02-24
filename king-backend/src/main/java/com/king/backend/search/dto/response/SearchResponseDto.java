package com.king.backend.search.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 검색 결과 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponseDto {
    private List<SearchResult> results;

    private long total;
    private String nextCursor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResult {
        private String category;
        private Long id;
        private String name;
        private String details;
        private String imageUrl;
        private boolean isFavorite;
        private String type;
        private String openHour;
        private String breakTime;
        private String closedDay;
        private String address;
    }
}
