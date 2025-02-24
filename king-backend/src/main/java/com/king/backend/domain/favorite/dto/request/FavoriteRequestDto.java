package com.king.backend.domain.favorite.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.annotations.ParameterObject;

@Getter
@Setter
@ParameterObject
public class FavoriteRequestDto {
    private String type;
    private Integer size;
    private String cursor;
}
