package com.king.backend.global.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ImageErrorCode implements ErrorCode {
    IMAGE_FILE_REQUIRED(HttpStatus.BAD_REQUEST, "게시글 이미지를 첨부해야 합니다."),
    MAX_UPLOAD_SIZE_EXCEEDED(HttpStatus.PAYLOAD_TOO_LARGE, "업로드된 파일이 너무 큽니다. 최대 허용 크기는 5MB입니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode(){
        return name();
    }
}
