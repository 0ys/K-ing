package com.king.backend.domain.place.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;


@Getter
@RequiredArgsConstructor
public enum PlaceErrorCode implements ErrorCode {
    PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "장소를 찾을 수 없습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "유효하지 않은 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,  "서버 내부 에러"),
    INVALID_VIEW_COUNT(HttpStatus.NO_CONTENT, "해당 카운트를 찾을 수 없습니다.");
    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
