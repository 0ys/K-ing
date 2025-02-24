package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.PostFeedRequestDto;
import com.king.backend.domain.post.dto.request.PostHomeRequestDto;
import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostDetailResponseDto;
import com.king.backend.domain.post.dto.response.PostFeedResponseDto;
import com.king.backend.domain.post.dto.response.PostHomeResponseDto;
import com.king.backend.domain.post.service.PostService;
import com.king.backend.global.aop.LogExecutionTime;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/post")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "게시글", description = "게시글 관련 CRUD")
public class PostController {

    private final PostService postService;

    @Operation(summary = "게시글 업로드")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Long>> uploadPost(
            @RequestPart("post") PostUploadRequestDto reqDto,
            @RequestPart(value = "imageFile", required = true) MultipartFile imageFile) {
        Long postId = postService.uploadPost(reqDto, imageFile);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postId));
    }


    @LogExecutionTime
    @Operation(summary = "게시글 전체 목록(홈피드) 조회")
    @GetMapping("/home")
    public ResponseEntity<ApiResponse<PostHomeResponseDto>> getHomePosts(
            @ModelAttribute PostHomeRequestDto reqDto
    ){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postService.getHomePostsWithCursor(reqDto)));
    }

    @Operation(summary = "장소 리뷰, 마이페이지 피드 조회",
    description = "1. 장소 리뷰 피드 조회 - 인기순, 최신순 정렬 기능\n" +
            "2. 마이페이지 - 로그인 사용자 페이지, 타사용자 페이지 피드 조회")
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<PostFeedResponseDto>> getFeedPosts(
            @ModelAttribute PostFeedRequestDto reqDto
    ){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(postService.getFeedPostsWithCursor(reqDto)));
    }

    @LogExecutionTime
    @Operation(summary = "게시글 상세 조회")
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostDetailResponseDto>> getPostDetail(@PathVariable Long postId,
                                                                            @RequestParam(defaultValue = "false") boolean original){
        PostDetailResponseDto post = postService.getPostDetail(postId, original);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(post));
    }

    @Operation(summary = "게시글 수정")
    @PostMapping(value="/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Long>> updatePost(
            @PathVariable Long postId,
            @RequestPart("post") PostUploadRequestDto reqDto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        Long updatedPostId = postService.updatePost(postId, reqDto, imageFile);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(updatedPostId));
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}
