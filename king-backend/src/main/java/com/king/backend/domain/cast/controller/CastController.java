package com.king.backend.domain.cast.controller;

import com.king.backend.domain.cast.dto.response.CastDetailResponseDto;
import com.king.backend.domain.cast.service.CastService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/cast")
@RequiredArgsConstructor
public class CastController {
    private final CastService castService;

    @Operation(summary = "연예인 상세 조회 API")
    @GetMapping("/{castId}")
    public ResponseEntity<ApiResponse<CastDetailResponseDto>> getCastDetail(@PathVariable Long castId) {
        log.info("GET /api/cast/{} 요청 처리 시작", castId);
        CastDetailResponseDto dto = castService.getCastDetail(castId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(dto));
    }
}
