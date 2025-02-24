package com.king.backend.global.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum TranslateErrorCode implements ErrorCode {
    GOOGLE_CREDENTIAL_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "구글 번역 인증에 실패했습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode(){
        return name();
    }
}
