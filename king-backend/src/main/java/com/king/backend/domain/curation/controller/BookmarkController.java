package com.king.backend.domain.curation.controller;

import com.king.backend.domain.curation.dto.request.BookmarkRequestDTO;
import com.king.backend.domain.curation.service.BookmarkService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookmark")
@RequiredArgsConstructor
@Tag(name = "북마크", description = "북마크/북마크 해제")
@SecurityRequirement(name = "BearerAuth")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @Operation(summary = "북마크")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> postBookmark(@RequestBody BookmarkRequestDTO requestDTO) {
        bookmarkService.postBookmark(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null));
    }

    @Operation(summary = "북마크 해제")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteBookmark(@RequestBody BookmarkRequestDTO requestDTO) {
        bookmarkService.deleteBookmark(requestDTO);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }
}
