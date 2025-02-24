package com.king.backend.domain.post.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PostErrorCode implements ErrorCode {
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "유효하지 않은 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,  "서버 내부 에러"),
    POST_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글 이미지를 찾을 수 없습니다."),
    POST_UPDATE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인이 작성한 게시글만 수정할 수 있습니다."),
    POST_DELETE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인이 작성한 게시글만 삭제할 수 있습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode(){
        return name();
    }
}
