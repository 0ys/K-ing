package com.king.backend.domain.content.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ContentErrorCode implements ErrorCode {
    CONTENT_NOT_FOUND(HttpStatus.NOT_FOUND, "컨텐츠를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,  "서버 내부 에러");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}