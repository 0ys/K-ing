package com.king.backend.search.controller;

import com.king.backend.global.response.ApiResponse;
import com.king.backend.search.dto.request.AutocompleteRequestDto;
import com.king.backend.search.dto.request.MapViewRequestDto;
import com.king.backend.search.dto.request.SearchRequestDto;
import com.king.backend.search.dto.response.AutocompleteResponseDto;
import com.king.backend.search.dto.response.MapViewResponseDto;
import com.king.backend.search.dto.response.SearchResponseDto;
import com.king.backend.search.service.SearchService;
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
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/search")
@Tag(name = "검색", description = "검색 및 자동완성 결과, 지도 표시 목록")
public class SearchController {

    private final SearchService searchService;

    /**
     * 자동완성 API
     * @param requestDto 자동완성 요청 DTO
     * @return 자동완성 결과
     */
    @Operation(summary = "사용자 입력 키워드(및 선택적 카테고리)를 기반 자동완성")
    @GetMapping("/autocomplete")
    public ResponseEntity<ApiResponse<AutocompleteResponseDto>> autocomplete(@ModelAttribute AutocompleteRequestDto requestDto) {
        AutocompleteResponseDto response = searchService.getAutocompleteSuggestions(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

    /**
     * 검색 API
     * @param requestDto 검색 요청 DTO
     * @return 검색 결과
     */
    @Operation(summary = "검색 키워드, 필터(카테고리/장소 유형/지역명) 기반 검색 결과 조회")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<SearchResponseDto>> search(@ModelAttribute SearchRequestDto requestDto) {
        SearchResponseDto response = searchService.search(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

    /**
     * 지도 보기 API
     * @param requestDto 지도 보기를 위한 필터 요청 DTO
     * @return 지도에 표시할 장소 목록과 적용된 필터
     */
    @Operation(summary = "필터(장소/지역명) 기반 지도에 표시할 장소 목록 조회")
    @GetMapping("/map-view")
    public ResponseEntity<ApiResponse<MapViewResponseDto>> mapView(@ModelAttribute MapViewRequestDto requestDto) {
        MapViewResponseDto response = searchService.getMapViewPlaces(requestDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }
}
