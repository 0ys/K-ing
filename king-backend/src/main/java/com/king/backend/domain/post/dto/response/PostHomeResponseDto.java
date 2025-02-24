package com.king.backend.domain.post.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class PostHomeResponseDto {
    private List<Post> posts;
    private String nextCursor;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Post {
        private Long postId;
        private String imageUrl;
        private Long likesCnt;
        private boolean isLiked;
        private Long commentsCnt;
        private Writer writer;
        private String content;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Writer {
        private Long userId;
        private String nickname;
    }
}