package com.king.backend.domain.content.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.entity.CastTranslation;
import com.king.backend.domain.content.dto.response.ContentDetailResponseDto;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.entity.ContentCast;
import com.king.backend.domain.content.entity.ContentTranslation;
import com.king.backend.domain.content.errorcode.ContentErrorCode;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.favorite.repository.FavoriteRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {
    private final ContentRepository contentRepository;
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;

    @Transactional
    public ContentDetailResponseDto getContentDetail(Long id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        String language = user.getLanguage();
        log.info("user language : {}", language);

        Content content = contentRepository.findById(id).orElseThrow(() -> new CustomException(ContentErrorCode.CONTENT_NOT_FOUND));
        ContentTranslation contentTrans = content.getTranslation(language);
        String imageUrl = s3Service.getOrUploadImage(content);
        String broadcast = content.getBroadcast();
        if(broadcast != null && broadcast.contains(",")) {
            String[] parts = broadcast.split(",");
            if(parts.length > 0) {
                broadcast = parts[0].trim();
            }
        }

        List<ContentDetailResponseDto.RelatedCast> relatedCasts = content.getContentCasts().stream()
                .map(cc -> mapToRelatedCasts(cc, user, language))
                .collect(Collectors.toList());

        Long contentId = content.getId();
        return new ContentDetailResponseDto(
                contentId,
                contentTrans.getTitle(),
                content.getType(),
                broadcast,
                contentTrans.getDescription(),
                imageUrl,
                content.getCreatedAt(),
                favoriteRepository.existsByUserAndTypeAndTargetId(user, "content", contentId),
                relatedCasts
        );
    }

    private ContentDetailResponseDto.RelatedCast mapToRelatedCasts(ContentCast contentCast, User user, String language) {
        Cast cast = contentCast.getCast();
        CastTranslation castTrans = cast.getTranslation(language);

        String castImageUrl = s3Service.getOrUploadImage(cast);

        Long castId = cast.getId();
        return new ContentDetailResponseDto.RelatedCast(
                castId,
                castTrans.getName(),
                castImageUrl,
                favoriteRepository.existsByUserAndTypeAndTargetId(user, "cast", castId)
        );
    }
}
