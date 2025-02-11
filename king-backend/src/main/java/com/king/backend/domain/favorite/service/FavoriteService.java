package com.king.backend.domain.favorite.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.entity.CastTranslation;
import com.king.backend.domain.cast.errorcode.CastErrorCode;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.entity.ContentTranslation;
import com.king.backend.domain.content.errorcode.ContentErrorCode;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.favorite.dto.response.FavoriteResponseDto;
import com.king.backend.domain.favorite.entity.Favorite;
import com.king.backend.domain.favorite.errorcode.FavoriteErrorCode;
import com.king.backend.domain.favorite.repository.FavoriteRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CastRepository castRepository;
    private final ContentRepository contentRepository;

    public void addFavorite(String type, Long targetId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if("cast".equalsIgnoreCase(type)) {
            type = "cast";
        } else if ("content".equalsIgnoreCase(type)) {
            type = "content";
        } else {
            throw new CustomException(FavoriteErrorCode.INVALID_FAVORITE_TYPE);
        }

        if (favoriteRepository.existsByUserAndTypeAndTargetId(user, type, targetId)) {
            throw new CustomException(FavoriteErrorCode.ALREADY_FAVORITE_ADDED);
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .type(type)
                .targetId(targetId)
                .createdAt(OffsetDateTime.now())
                .build();
        favoriteRepository.save(favorite);
    }

    public void removeFavorite(String type, Long targetId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if("cast".equalsIgnoreCase(type)) {
            type = "cast";
        } else if ("content".equalsIgnoreCase(type)) {
            type = "content";
        } else {
            throw new CustomException(FavoriteErrorCode.INVALID_FAVORITE_TYPE);
        }

        Favorite favorite = favoriteRepository.findByUserAndTypeAndTargetId(user, type, targetId)
                .orElseThrow(() -> new CustomException(FavoriteErrorCode.ALREADY_FAVORITE_REMOVED));

        favoriteRepository.delete(favorite);
    }

    public FavoriteResponseDto getFavorites(String type) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        String language = user.getLanguage();

        List<Favorite> favorites = favoriteRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type);

        List<FavoriteResponseDto.Favorite> favoriteDtos = new ArrayList<>();
        for (Favorite fav : favorites) {
            FavoriteResponseDto.Favorite dto = FavoriteResponseDto.Favorite.builder().build();
            dto.setFavoriteId(fav.getId());
            dto.setType(fav.getType());
            dto.setTargetId(fav.getTargetId());

            if ("cast".equalsIgnoreCase(type)) {
                Cast cast = castRepository.findById(fav.getTargetId())
                        .orElseThrow(() -> new CustomException(CastErrorCode.CAST_NOT_FOUND));
                CastTranslation castTrans = cast.getTranslation(language);
                dto.setTitle(castTrans.getName());
                dto.setImageUrl(cast.getImageUrl());
            } else if ("content".equalsIgnoreCase(type)) {
                Content content = contentRepository.findById(fav.getTargetId())
                        .orElseThrow(() -> new CustomException(ContentErrorCode.CONTENT_NOT_FOUND));
                ContentTranslation contentTrans = content.getTranslation(language);
                dto.setTitle(contentTrans.getTitle());
                dto.setImageUrl(content.getImageUrl());
            } else {
                throw new CustomException(FavoriteErrorCode.INVALID_FAVORITE_TYPE);
            }
            favoriteDtos.add(dto);
        }

        return FavoriteResponseDto.builder()
                .favorites(favoriteDtos)
                .favoriteCount((long) favoriteDtos.size())
                .build();
    }
}
