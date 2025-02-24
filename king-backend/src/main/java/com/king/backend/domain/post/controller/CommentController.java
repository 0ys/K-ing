package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.CommentRequestDto;
import com.king.backend.domain.post.dto.request.CommentUploadRequestDto;
import com.king.backend.domain.post.dto.response.CommentAllResponseDto;
import com.king.backend.domain.post.service.CommentService;
import com.king.backend.domain.post.service.PostService;
import com.king.backend.global.aop.LogExecutionTime;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/post/{postId}/comment")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "댓글", description = "댓글 관련 CRUD")
public class CommentController {
    private final PostService postService;
    private final CommentService commentService;

    @Operation(summary = "댓글 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> uploadComent(
            @PathVariable Long postId,
            @RequestBody CommentUploadRequestDto reqDto){
        commentService.uploadComment(postId, reqDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId){
        commentService.deleteComment(commentId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @LogExecutionTime
    @Operation(summary = "댓글 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<CommentAllResponseDto>> getComments(
            @PathVariable Long postId,
            @ModelAttribute CommentRequestDto reqDto){
        CommentAllResponseDto resDto = commentService.getComments(postId, reqDto);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(resDto));
    }
}
