package com.king.backend.domain.user.errorcode;

import com.king.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {
    NOT_PENDING_USER(HttpStatus.BAD_REQUEST, "닉네임 입력 단계의 유저가 아닙니다."),
    OAUTH2_LOGIN_FAILED(HttpStatus.BAD_REQUEST, "소셜로그인 사용자를 받아올 수 없습니다."),
    ACCESSTOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "accessToken이 만료되었습니다."),
    REFRESHTOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "refreshToken이 만료되었습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    DUPLICATED_NICKNAME(HttpStatus.CONFLICT, "중복된 닉네임입니다"),
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "유효하지 않은 닉네임입니다"),
    INVALID_LANGUAGE(HttpStatus.BAD_REQUEST, "유효하지 않은 언어코드입니다"),
    INVALD_VALUE(HttpStatus.BAD_REQUEST, "잘못된 값으로 요청을 시도하고 있습니다"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 id의 유저를 찾을 수 없습니다");

    private final HttpStatus status;
    private final String message;

    @Override
    public String getCode() {
        return name();
    }
}
