package com.king.backend.domain.curation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CurationRequestDTO {
    @Schema(description = "큐레이션 제목", example = "내가 보려고 만든 큐레이션", maxLength = 50)
    String title;

    @Schema(description = "큐레이션 설명", example = "이 큐레이션은 유명한 영화 촬영지를 소개합니다.", maxLength = 1000)
    String description;

    boolean isPublic = true;
    List<Long> placeIds;
}
