package com.king.backend.domain.post.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.annotations.ParameterObject;

@Getter
@Setter
@ParameterObject
public class PostFeedRequestDto {
    private String feedType;
    private Long userId;
    private Long placeId;
    private Integer size;
    private String cursor;
    private String sortedBy;
}
