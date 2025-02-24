package com.king.backend.domain.user.jwt;

import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.global.exception.CustomException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWTUtil {

    private final SecretKey SECRET_KEY;

    public JWTUtil(@Value("${spring.jwt.secret}") String secret) {
        SECRET_KEY = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    public Claims validToken (String token) {
        try {
            return Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new CustomException(UserErrorCode.ACCESSTOKEN_EXPIRED);
        } catch (Exception e) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }
    }

    public String getType(String token) {
        return validToken(token).get("type", String.class);
    }

    public String getUserId(String token) {
        return validToken(token).get("userId", String.class);
    }

    public String getLanguage(String token) {
        return validToken(token).get("language", String.class);
    }

    public String getRole(String token) {
        return validToken(token).get("role", String.class);
    }

    public String createJwt(String type, String userId, String language, String role, Long expireMs) {
        return Jwts.builder()
                .claim("type", type)
                .claim("userId", userId)
                .claim("language", language)
                .claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expireMs))
                .signWith(SECRET_KEY)
                .compact();
    }
}
