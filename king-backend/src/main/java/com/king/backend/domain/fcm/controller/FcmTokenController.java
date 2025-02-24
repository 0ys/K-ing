package com.king.backend.domain.fcm.controller;

import com.king.backend.domain.fcm.dto.requestDto.FcmRequestDto;
import com.king.backend.domain.fcm.service.FcmTokenService;
import com.king.backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/fcm")
public class FcmTokenController {
    private final FcmTokenService fcmService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestBody FcmRequestDto reqDto) {
        fcmService.registerToken(reqDto.getToken());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteToken(@RequestBody FcmRequestDto reqDto){
        fcmService.deleteToken(reqDto.getToken());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(null));
    }
}
