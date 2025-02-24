package com.king.backend.domain.post.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CommentErrorCode implements ErrorCode {
    INVALID_COMMENT(HttpStatus.BAD_REQUEST, "댓글 내용을 작성해야 합니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    COMMENT_DELETE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인이 작성한 댓글만 삭제할 수 있습니다.");


    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode(){
        return name();
    }
}
