package com.king.backend.domain.cast.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CastDetailResponseDto {
    private Long castId;
    private String name;
    private String imageUrl;
    private String birthDate;
    private String birthPlace;
    private Long participatingWorks;
    private OffsetDateTime createdAt;
    private boolean isFavorite;
    private List<RelatedContent> relatedContents;
    private List<Work> works;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedContent {
        private Long contentId;
        private String title;
        private String imageUrl;
        private boolean isFavorite;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Work {
        private Long contentId;
        private String year;
        private String title;
    }
}
