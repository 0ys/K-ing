package com.king.backend.ai.websocket;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.jwt.JWTUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSecurityInterceptor implements HandshakeInterceptor {

    private final JWTUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        log.info("🛠️ WebSocket 핸드셰이크 요청 수신...");
        log.info("🔎 요청 정보: URI={}, Headers={}", request.getURI(), request.getHeaders());

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token");  // ✅ WebSocket URL에서 토큰 추출
            log.info("🔑 WebSocket 인증 요청: {}", token);

            try {
                jwtUtil.validToken(token);
                log.info("✅ JWT 인증 성공: {}", token);
            } catch (Exception e) {
                log.error("❌ JWT 인증 실패: {}", e.getMessage());
                return false;
            }

            String userId = jwtUtil.getUserId(token);
            attributes.put("userId", userId);
            log.info("✅ WebSocket 인증 성공 - 사용자 ID: {}", userId);
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        log.info("✅ WebSocket 핸드셰이크 완료");
    }
}

