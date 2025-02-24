package com.king.backend.domain.post.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.annotations.ParameterObject;

@Getter
@Setter
@ParameterObject
public class CommentRequestDto {
    Integer size;
    String cursor;
    boolean original = false;
}
