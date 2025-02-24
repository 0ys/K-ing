package com.king.backend.domain.content.controller;

import com.king.backend.domain.content.dto.response.ContentDetailResponseDto;
import com.king.backend.domain.content.service.ContentService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/content")
@RequiredArgsConstructor
@Tag(name = "컨텐츠", description = "컨텐츠 상세 페이지 조회")
public class ContentController {
    private final ContentService contentService;

    @Operation(summary = "컨텐츠 상세 조회")
    @GetMapping("/{contentId}")
    public ResponseEntity<ApiResponse<ContentDetailResponseDto>> getContentDetail(@PathVariable Long contentId){
        log.info("GET /api/content/{} 요청 처리 시작", contentId);
        ContentDetailResponseDto dto = contentService.getContentDetail(contentId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(dto));
    }
}
