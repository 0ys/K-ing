package com.king.backend.domain.user;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.dto.domain.OidcUserDTO;
import com.king.backend.domain.user.entity.TokenEntity;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import com.king.backend.global.exception.CustomException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

@Component
@RequiredArgsConstructor
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtil jwtUtil;
    private final TokenRepository tokenRepository;

    @Value("${spring.jwt.refreshtoken-expires-in}")
    private Long REFRESHTOKEN_EXPIRES_IN;

    @Value("${client.url}")
    private String CLIENT_URL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String userId = null;
        String language = null;
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2UserDTO) {
            OAuth2UserDTO oAuth2UserDTO = (OAuth2UserDTO) authentication.getPrincipal();

            userId = oAuth2UserDTO.getName();
            language = oAuth2UserDTO.getLanguage();
        } else if (principal instanceof OidcUserDTO) {
            OidcUserDTO oidcUserDTO= (OidcUserDTO) authentication.getPrincipal();

            userId = oidcUserDTO.getName();
            language = oidcUserDTO.getLanguage();
        }

        if (userId == null) {
            throw new CustomException(UserErrorCode.OAUTH2_LOGIN_FAILED);
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority authority = iterator.next();
        String role = authority.getAuthority();

        String refreshToken = jwtUtil.createJwt("refreshToken", userId, language, role, REFRESHTOKEN_EXPIRES_IN);

        TokenEntity token = new TokenEntity(Long.parseLong(userId), refreshToken, REFRESHTOKEN_EXPIRES_IN);
        tokenRepository.save(token);
        response.addCookie(createCookie("refreshToken", refreshToken));
        response.sendRedirect(CLIENT_URL + "/token");
    }

    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60*60*60);
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;
    }
}
