package com.king.backend.domain.post.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.annotations.ParameterObject;

@Getter
@Setter
@ParameterObject
public class PostHomeRequestDto {
    private Integer size;
    private String cursor;
}
