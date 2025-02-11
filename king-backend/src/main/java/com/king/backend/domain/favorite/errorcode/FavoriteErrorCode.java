package com.king.backend.domain.favorite.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum FavoriteErrorCode implements ErrorCode {
    ALREADY_FAVORITE_ADDED(HttpStatus.BAD_REQUEST, "이미 즐겨찾기한 항목입니다."),
    ALREADY_FAVORITE_REMOVED(HttpStatus.NOT_FOUND, "즐겨찾기를 하지 않은 항목입니다."),
    INVALID_FAVORITE_TYPE(HttpStatus.BAD_REQUEST, "잘못된 즐겨찾기 타입입니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
