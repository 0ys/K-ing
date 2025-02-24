package com.king.backend.search.controller;

import com.king.backend.global.response.ApiResponse;
import com.king.backend.search.dto.request.CurationListSearchRequestDto;
import com.king.backend.search.dto.response.CurationListSearchResponseDto;
import com.king.backend.search.service.CurationSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/curation-lists")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "큐레이션 리스트 검색")
public class CurationListController {
    private final CurationSearchService curationSearchService;

    /**
     * 큐레이션 리스트 제목 검색 및 전체 조회 API (커서 기반 페이지네이션)
     *
     * @param requestDto 검색 요청 DTO (query, size, cursor 포함)
     * @return ApiResponse로 감싼 검색 결과 DTO
     */
    @Operation(summary = "큐레이션 리스트 제목 검색 및 전체 조회")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<CurationListSearchResponseDto>> searchCurationLists(
            @ModelAttribute CurationListSearchRequestDto requestDto) {
        CurationListSearchResponseDto response = curationSearchService.searchCurationLists(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }
}
