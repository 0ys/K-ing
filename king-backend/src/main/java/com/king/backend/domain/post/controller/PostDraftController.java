package com.king.backend.domain.post.controller;

import com.king.backend.domain.post.dto.request.PostDraftRequestDto;
import com.king.backend.domain.post.dto.response.PostDraftResponseDto;
import com.king.backend.domain.post.service.PostDraftService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/post/draft")
@RequiredArgsConstructor
@Tag(name = "게시글 임시저장", description = "게시글 임시저장 관련 CRUD")
public class PostDraftController {
    private final PostDraftService postDraftService;

    @Operation(summary = "게시글 임시저장 하기")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> saveDraft(
            @RequestPart(value="draft") PostDraftRequestDto reqDto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        postDraftService.saveDraft(reqDto, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null));
    }

    @Operation(summary = "임시저장 게시글 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<PostDraftResponseDto>> getDraft() {
        PostDraftResponseDto draft = postDraftService.getDraft();
        if (draft == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
        }
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(draft));
    }

    @Operation(summary = "임시저장 게시글 삭제")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteDraft() {
        postDraftService.deleteDraft();
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}
