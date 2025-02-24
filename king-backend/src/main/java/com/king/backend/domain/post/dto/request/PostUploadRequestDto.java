package com.king.backend.domain.post.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostUploadRequestDto {
    private String content;
    private Long placeId;
    private boolean isPublic;
}