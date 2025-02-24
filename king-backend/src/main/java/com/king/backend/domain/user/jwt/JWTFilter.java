package com.king.backend.domain.user.jwt;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            String requestUri = request.getRequestURI();
            String requestMethod = request.getMethod();

            if (requestUri.matches("^/api/user/token-refresh$") && requestMethod.equals("POST")) {
                filterChain.doFilter(request, response);
                return;
            }

            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "accessToken이 유효하지 않습니다");
            return;
        }

        String accessToken = authorization.substring(7);

        try {
            jwtUtil.validToken(accessToken);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "accessToken이 유효하지 않습니다");
            return;
        }

        String type = jwtUtil.getType(accessToken);
        if (!type.equals("accessToken")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "accessToken이 유효하지 않습니다");
            return;
        }

        String userId = jwtUtil.getUserId(accessToken);
        String role = jwtUtil.getRole(accessToken);
        String language = jwtUtil.getLanguage(accessToken);

        OAuth2UserDTO oAuth2UserDTO = new OAuth2UserDTO();
        oAuth2UserDTO.setName(userId);
        oAuth2UserDTO.setLanguage(language);
        oAuth2UserDTO.setAuthorities(List.of(new SimpleGrantedAuthority(role)));

        Authentication authToken = new UsernamePasswordAuthenticationToken(oAuth2UserDTO, null, oAuth2UserDTO.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
