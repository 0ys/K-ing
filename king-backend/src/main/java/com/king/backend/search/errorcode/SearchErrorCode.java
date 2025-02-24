package com.king.backend.search.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SearchErrorCode implements ErrorCode {
    INVALID_CURSOR(HttpStatus.BAD_REQUEST,"유효하지 않은 커서입니다."),
    SEARCH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "검색에 실패했습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}

