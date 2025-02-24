package com.king.backend.domain.cast.service;

import com.king.backend.domain.cast.dto.response.CastDetailResponseDto;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.entity.CastTranslation;
import com.king.backend.domain.cast.errorcode.CastErrorCode;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.ContentCast;
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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CastService {
    private final CastRepository castRepository;
    private final S3Service s3Service;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Transactional
    public CastDetailResponseDto getCastDetail(Long id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        String language = oauthUser.getLanguage();
        log.info("user language : {}", language);

        Cast cast = castRepository.findById(id).orElseThrow(() -> new CustomException(CastErrorCode.CAST_NOT_FOUND));
        List<CastDetailResponseDto.RelatedContent> relatedContents = new ArrayList<>();
        List<CastDetailResponseDto.Work> works = new ArrayList<>();

        String imageUrl = s3Service.getOrUploadImage(cast);

        if (cast != null) {
            List<ContentCast> sortedContentCasts = cast.getContentCasts().stream()
                    .sorted((c1, c2) -> {
                        if (c1.getContent().getCreatedAt() == null && c2.getContent().getCreatedAt() == null) {
                            return 0;
                        }
                        if (c1.getContent().getCreatedAt() == null) return 1;
                        if (c2.getContent().getCreatedAt() == null) return -1;
                        return c2.getContent().getCreatedAt().compareTo(c1.getContent().getCreatedAt());
                    })
                    .toList();

            for (ContentCast contentCast : sortedContentCasts) {
                Long contentId = contentCast.getContent().getId();
                String title = contentCast.getContent().getTranslation(language).getTitle();
                String contentImageUrl = s3Service.getOrUploadImage(contentCast.getContent());
                String year = (contentCast.getContent().getCreatedAt() == null) ? "" : String.valueOf(contentCast.getContent().getCreatedAt().getYear());
                relatedContents.add(new CastDetailResponseDto.RelatedContent(
                        contentId,
                        title,
                        contentImageUrl,
                        favoriteRepository.existsByUserAndTypeAndTargetId(user, "content", contentId)
                ));
                works.add(new CastDetailResponseDto.Work(contentId, year, title));
            }
        }

        CastTranslation castTrans = cast.getTranslation(language);
        String rawBirthPlace = castTrans.getBirthPlace();
        String parsedBirthPlace = parseBirthPlace(rawBirthPlace);

        Long castId = cast.getId();
        return new CastDetailResponseDto(
                castId,
                castTrans.getName(),
                imageUrl,
                cast.getBirthDate(),
                parsedBirthPlace,
                cast.getParticipatingWork(),
                cast.getCreatedAt(),
                favoriteRepository.existsByUserAndTypeAndTargetId(user, "cast", castId),
                relatedContents,
                works
        );
    }

    private String parseBirthPlace(String birthPlace) {
        if (birthPlace == null || birthPlace.isEmpty()) {
            return birthPlace;
        }

        String parsedBirthPlace = birthPlace;

        // [now] 존재 시 [now] 정보만 추출
        int nowStart = birthPlace.indexOf("[now");
        if (nowStart != -1) {
            int nowEnd = birthPlace.indexOf("]", nowStart);
            if (nowEnd != -1) {
                String nowContent = birthPlace.substring(nowStart + "[now".length(), nowEnd).trim();
                parsedBirthPlace = nowContent;
            }
        }

        // [now] 없으면 쉼표로 분리/ 지역,국가 정보만 반환
        String[] parts = parsedBirthPlace.split(",");
        if (parts.length >= 3) {
            String region = parts[parts.length - 2].trim();
            String country = parts[parts.length - 1].trim();
            return region + ", " + country;
        } else {
            return parsedBirthPlace.trim();
        }
    }
}
