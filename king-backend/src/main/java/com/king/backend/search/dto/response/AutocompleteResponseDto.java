package com.king.backend.search.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 자동완성 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteResponseDto {
    private List<AutocompleteResult> results;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutocompleteResult {
        private String originalId;
        private String category;
        private String name;
        private String details;
    }
}
