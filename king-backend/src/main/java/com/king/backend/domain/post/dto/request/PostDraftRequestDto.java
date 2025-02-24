package com.king.backend.domain.post.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDraftRequestDto {
    private String content;
    private Long placeId;
    private boolean isPublic;
}
