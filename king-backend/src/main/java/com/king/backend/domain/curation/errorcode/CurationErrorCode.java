package com.king.backend.domain.curation.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CurationErrorCode implements ErrorCode {
    CURATION_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 큐레이션 리스트를 찾을 수 없습니다."),
    INVALID_VALUE(HttpStatus.BAD_REQUEST, "필수값이 없거나 글자수 제한을 초과했습니다"),
    INVALID_IMAGEFILE(HttpStatus.BAD_REQUEST, "배경 이미지가 없습니다"),
    DUPLICATED_PLACE(HttpStatus.CONFLICT, "중복된 장소가 있습니다"),
    FORBIDDEN_CURATION(HttpStatus.FORBIDDEN, "유저의 큐레이션이 아닙니다");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
