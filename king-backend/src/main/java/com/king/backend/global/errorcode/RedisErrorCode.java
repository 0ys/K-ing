package com.king.backend.global.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum RedisErrorCode implements ErrorCode {
    REDIS_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Redis 저장 중 오류가 발생했습니다."),
    REDIS_FETCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Redis 조회 중 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode(){
        return name();
    }
}
