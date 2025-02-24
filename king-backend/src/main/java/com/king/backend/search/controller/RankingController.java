package com.king.backend.search.controller;

import com.king.backend.global.response.ApiResponse;
import com.king.backend.search.dto.response.RankingDto;
import com.king.backend.search.service.RankingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/ranking")
@Tag(name = "실시간 검색 키워드 랭킹")
public class RankingController {
    private final RankingService rankingService;

    /**
     * 검색어 랭킹 조회 API
     * @param period 조회 기간 (realtime, daily, weekly)
     * @return 랭킹 데이터 목록
     */
    @Operation(summary = "실시간 검색 키워드 랭킹")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RankingDto>>> getRanking(
            @RequestParam(value = "period", defaultValue = "realtime") String period) {
        List<RankingDto> rankingList = rankingService.getRanking(period);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(rankingList));
    }
}
