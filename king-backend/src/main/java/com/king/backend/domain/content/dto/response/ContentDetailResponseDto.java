package com.king.backend.domain.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ContentDetailResponseDto {
    private Long contentId;
    private String title;
    private String type;
    private String broadcast;
    private String description;
    private String imageUrl;
    private OffsetDateTime createdAt;
    private boolean isFavorite;
    private List<RelatedCast> relatedCasts;

    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    public static class RelatedCast {
        private Long castId;
        private String name;
        private String imageUrl;
        private boolean isFavorite;
    }
}
