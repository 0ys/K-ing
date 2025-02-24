package com.king.backend.ai.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.extern.slf4j.Slf4j;
import java.util.Optional;
import java.util.Map;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Slf4j
public class AuthUtil {

    public static Optional<OAuth2UserDTO> getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("🚨 SecurityContext에 Authentication이 없거나 인증되지 않았습니다.");
            return Optional.empty();
        }

        try {
            Object principal = authentication.getPrincipal();

            log.debug("🔍 Principal 객체 타입: {}", principal.getClass().getName());

            if (principal instanceof OAuth2UserDTO) {
                OAuth2UserDTO user = (OAuth2UserDTO) principal;
                log.debug("✅ 가져온 사용자 정보 - ID: {}, Language: {}", user.getName(), user.getLanguage());
                return Optional.of(user);
            } else if (principal instanceof OAuth2User) {
                // Spring Security 기본 OAuth2User 객체일 경우
                OAuth2User oauthUser = (OAuth2User) principal;
                Map<String, Object> attributes = oauthUser.getAttributes();

                log.debug("🔍 OAuth2User Attributes: {}", attributes);

                String name = (String) attributes.get("name");
                String language = (String) attributes.get("language");

                if (name != null && language != null) {
                    OAuth2UserDTO userDTO = new OAuth2UserDTO();
                    userDTO.setName(name);
                    userDTO.setLanguage(language);
                    return Optional.of(userDTO);
                }
            }

            return Optional.empty();
        } catch (Exception e) {
            log.error("❌ 사용자 정보를 가져오는 중 오류 발생: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
}

