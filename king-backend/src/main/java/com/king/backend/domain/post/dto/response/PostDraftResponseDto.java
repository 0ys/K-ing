package com.king.backend.domain.post.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDraftResponseDto {
    private String content;
    private Place place;
    private byte[] imageData;
    private boolean isPublic;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Place {
        private Long placeId;
        private String name;
    }
}
