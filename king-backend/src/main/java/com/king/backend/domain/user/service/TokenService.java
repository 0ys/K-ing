package com.king.backend.domain.user.service;

import com.king.backend.domain.user.entity.TokenEntity;
import com.king.backend.domain.user.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final TokenRepository tokenRepository;

    public Optional<TokenEntity> findTokenById(Long id) {
        return tokenRepository.findById(id);
    }
}
