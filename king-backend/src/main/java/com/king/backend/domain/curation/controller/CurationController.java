package com.king.backend.domain.curation.controller;

import com.king.backend.domain.curation.dto.request.CurationQueryRequestDTO;
import com.king.backend.domain.curation.dto.request.CurationRequestDTO;
import com.king.backend.domain.curation.dto.response.CurationDetailResponseDTO;
import com.king.backend.domain.curation.dto.response.CurationListResponseDTO;
import com.king.backend.domain.curation.service.CurationService;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/curation")
@RequiredArgsConstructor
@Tag(name = "큐레이션 컨트롤러", description = "큐레이션 관련 CRUD")
@SecurityRequirement(name = "BearerAuth")
public class CurationController {
    private final CurationService curationService;

    @Operation(summary = "큐레이션 상세 조회")
    @GetMapping("/{curationListId}")
    public ResponseEntity<ApiResponse<CurationDetailResponseDTO>> getCurationDetail(@PathVariable(value = "curationListId") Long curationListId) {
        CurationDetailResponseDTO curationDetailResponseDTO = curationService.getCurationDetail(curationListId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(curationDetailResponseDTO));
    }

    @Operation(summary = "큐레이션 목록 조회")
    @GetMapping("")
    public ResponseEntity<ApiResponse<CurationListResponseDTO>> getCurations(@ModelAttribute CurationQueryRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(curationService.getCurations(requestDTO)));
    }

    @Operation(summary = "큐레이션 생성")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<CurationDetailResponseDTO>> postCurations(
            @RequestPart(value = "curation") CurationRequestDTO requestDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(curationService.postCuration(requestDTO, imageFile)));
    }

    @Operation(summary = "큐레이션 수정")
    @PutMapping(value = "/{curationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<CurationDetailResponseDTO>> putCuration(
            @PathVariable(value = "curationId") Long curationId,
            @RequestPart(value = "curation") CurationRequestDTO requestDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(curationService.putCuration(curationId, requestDTO, imageFile)));
    }

    @Operation(summary = "큐레이션 삭제")
    @DeleteMapping(value = "/{curationId}")
    public ResponseEntity<ApiResponse<Void>> deleteCuration(@PathVariable(value = "curationId") Long curationId) {
        curationService.deleteCuration(curationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }
}
