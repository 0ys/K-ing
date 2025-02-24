package com.king.backend.domain.post.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
@Builder
public class PostDetailResponseDto {
    private Long postId;
    private Writer writer;
    private Place place;
    private String content;
    private String imageUrl;
    private boolean isPublic;
    private OffsetDateTime createdAt;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Writer {
        private Long userId;
        private String nickname;
        private String imageUrl;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Place {
        private Long placeId;
        private String name;
    }
}

