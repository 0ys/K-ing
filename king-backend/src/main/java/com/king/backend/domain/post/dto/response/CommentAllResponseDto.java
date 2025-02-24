package com.king.backend.domain.post.dto.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentAllResponseDto {
    private boolean isLiked;
    private Long likesCount;
    private Long commentsCount;
    private List<Comment> comments;
    private String nextCursor;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Comment {
        private Long commentId;
        private String content;
        private OffsetDateTime createdAt;
        private Writer writer;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class Writer {
        private Long userId;
        private String nickname;
        private String imageUrl;
    }
}