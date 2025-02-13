package com.king.backend.domain.fcm.controller;

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
    public ResponseEntity<ApiResponse<?>> registerToken(@RequestBody String token) {
        fcmService.registerToken(token);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<?>> deleteToken(@RequestBody String token){
        fcmService.deleteToken(token);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(null));
    }
}