package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.service.LikeService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/post/{postId}/like")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "좋아요", description = "좋아요 등록/취소")
public class LikeController {

    private final LikeService likeService;

    @Operation(summary = "게시글 좋아요 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> like(@PathVariable Long postId) {
        likeService.likePost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "게시글 좋아요 취소")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> unlikePost(@PathVariable Long postId) {
        likeService.unlikePost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}
