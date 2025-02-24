package com.king.backend.domain.user.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@RedisHash(value = "token")
@AllArgsConstructor
@Getter
public class TokenEntity {
    @Id
    private Long id;
    private String refreshToken;
    @TimeToLive
    private Long expiration;
}
