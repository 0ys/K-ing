package com.king.backend.domain.favorite.controller;

import com.king.backend.domain.favorite.dto.request.FavoriteRequestDto;
import com.king.backend.domain.favorite.dto.response.FavoriteResponseDto;
import com.king.backend.domain.favorite.service.FavoriteService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/favorite")
@RequiredArgsConstructor
@Tag(name = "즐겨찾기", description = "즐겨찾기 관련 CRUD")
public class FavoriteController {
    private final FavoriteService favoriteService;

    @Operation(summary = "즐겨찾기 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @RequestParam("type") String type,
            @RequestParam("targetId") Long targetId
    ) {
        favoriteService.addFavorite(type, targetId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "즐겨찾기 해제")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @RequestParam("type") String type,
            @RequestParam("targetId") Long targetId
    ) {
        favoriteService.removeFavorite(type, targetId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "즐겨찾기 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<FavoriteResponseDto>> getFavorites(
            @ModelAttribute FavoriteRequestDto reqDto
    ) {
        FavoriteResponseDto resDto = favoriteService.getFavorites(reqDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(resDto));
    }
}
