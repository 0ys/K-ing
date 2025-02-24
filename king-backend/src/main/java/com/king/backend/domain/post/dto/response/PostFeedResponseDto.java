package com.king.backend.domain.post.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class PostFeedResponseDto {
    private List<Post> posts;
    private String nextCursor;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Post {
        private Long postId;
        private String imageUrl;
        private boolean isPublic;
    }
}
