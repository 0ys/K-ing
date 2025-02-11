package com.king.backend.domain.curation.controller;

import com.king.backend.domain.curation.dto.request.CurationPostRequestDTO;
import com.king.backend.domain.curation.dto.response.CurationDraftResponseDTO;
import com.king.backend.domain.curation.service.CurationDraftService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "큐레이션 임시저장", description = "큐레이션 임시저장 관련 CRUD")
@RestController
@RequestMapping("/curation/draft")
@RequiredArgsConstructor
public class CurationDraftController {
    private final CurationDraftService curationDraftService;

    @Operation(summary = "큐레이션 임시저장 하기")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> postCuration(
            @RequestPart(value = "curation") CurationPostRequestDTO requestDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
            curationDraftService.saveDraft(requestDTO, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null));
    }

    @Operation(summary = "임시 저장된 큐레이션 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<CurationDraftResponseDTO>> getCuration() {

        CurationDraftResponseDTO draft = curationDraftService.getDraft();
        if (draft == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
        }
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(draft));
    }

    @Operation(summary = "임시 저장된 큐레이션 삭제")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteDraft() {
        curationDraftService.deleteDraft();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }
}
