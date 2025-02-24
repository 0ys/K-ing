package com.king.backend.s3.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum S3ErrorCode implements ErrorCode {

    S3_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S3 파일 업로드에 실패했습니다."),
    S3_DELETE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S3 파일 삭제에 실패했습니다."),
    S3_URL_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S3 URL 변환에 실패했습니다."),
    TMDB_IMAGE_DOWNLOAD_FAILED(HttpStatus.BAD_REQUEST, "TMDB 이미지 다운로드에 실패했습니다."),
    TMDB_IMAGE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "TMDB 이미지 업로드에 실패했습니다."),
    UNSUPPORTED_ENTITY_TYPE(HttpStatus.BAD_REQUEST, "지원되지 않는 엔티티 타입입니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
