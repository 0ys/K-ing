package com.king.backend.domain.curation.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.annotations.ParameterObject;

@Getter
@Setter
@ParameterObject
public class CurationQueryRequestDTO {
    Long userId;
    Integer size;
    String cursor;
}
