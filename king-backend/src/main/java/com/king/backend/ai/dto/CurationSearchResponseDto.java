package com.king.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurationSearchResponseDto {
    private List<CurationResult> curations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurationResult {
        private Long curationId;
        private String title;
        private String description;
    }
}

