package com.king.backend.domain.favorite.controller;

import com.king.backend.domain.favorite.dto.response.FavoriteResponseDto;
import com.king.backend.domain.favorite.service.FavoriteService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/favorite")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @Operation(summary = "즐겨찾기 등록 API")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @RequestParam("type") String type,
            @RequestParam("targetId") Long targetId
    ) {
        favoriteService.addFavorite(type, targetId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "즐겨찾기 해제 API")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @RequestParam("type") String type,
            @RequestParam("targetId") Long targetId
    ) {
        favoriteService.removeFavorite(type, targetId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "즐겨찾기 목록 조회 API")
    @GetMapping
    public ResponseEntity<ApiResponse<FavoriteResponseDto>> getFavorites(
            @RequestParam("type") String type
    ) {
        FavoriteResponseDto resDto = favoriteService.getFavorites(type);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(resDto));
    }
}
