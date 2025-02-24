package com.king.backend.ai.config;

import com.king.backend.ai.websocket.ChatWebSocketHandler;
import com.king.backend.ai.websocket.WebSocketSecurityInterceptor;
import com.king.backend.domain.user.jwt.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.Collections;

@Slf4j
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final WebSocketSecurityInterceptor webSocketSecurityInterceptor;

    @Value("${client.url}")
    private String CLIENT_URL;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chatT", "/ws/chatF")
                .setAllowedOrigins(CLIENT_URL)
                .addInterceptors(webSocketSecurityInterceptor);

        log.info("✅ WebSocket 핸들러 등록 완료");
    }

}


