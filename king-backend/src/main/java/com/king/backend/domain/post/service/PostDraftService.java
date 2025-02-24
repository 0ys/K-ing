package com.king.backend.domain.post.service;

import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.domain.post.dto.request.PostDraftRequestDto;
import com.king.backend.domain.post.dto.response.PostDraftResponseDto;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.errorcode.ImageErrorCode;
import com.king.backend.global.errorcode.RedisErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostDraftService {
    private final RedisUtil redisUtil;
    private final PlaceRepository placeRepository;

    public void saveDraft(PostDraftRequestDto reqDto, MultipartFile imageFile) {
        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        redisUtil.setJsonValue(draftKey, reqDto);

        if(imageFile != null && !imageFile.isEmpty()) {
            long maxFileSize = 5 * 1024 * 1024;
            if(imageFile.getSize() > maxFileSize) {
                throw new CustomException(ImageErrorCode.MAX_UPLOAD_SIZE_EXCEEDED);
            }
            try {
                byte[] imageBytes = imageFile.getBytes();
                redisUtil.setBinaryValue(imageKey, imageBytes);
            } catch (IOException e) {
                throw new CustomException(RedisErrorCode.REDIS_SAVE_FAILED);
            }
        }
    }

    public PostDraftResponseDto getDraft() {
        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        PostDraftRequestDto draft = redisUtil.getJsonValue(draftKey, PostDraftRequestDto.class);
        if (draft == null) {
            return null;
        }

        PostDraftResponseDto.Place placeDto = null;
        if (draft.getPlaceId() != null) {
            Place place = placeRepository.findById(draft.getPlaceId())
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));
            placeDto = PostDraftResponseDto.Place.builder()
                    .placeId(place.getId())
                    .name(place.getName())
                    .build();
        }

        byte[] imageData = redisUtil.getBinaryValue(imageKey);

        return PostDraftResponseDto.builder()
                .content(draft.getContent())
                .place(placeDto)
                .imageData(imageData)
                .isPublic(draft.isPublic())
                .build();
    }

    public void deleteDraft() {
        String draftKey = getDraftKey();
        String imageKey = draftKey + ":image";

        redisUtil.deleteValue(draftKey);
        redisUtil.deleteBinaryValue(imageKey);
    }

    private String getDraftKey() {
        Long userId = getCurrentUserId();
        return "post:draft:user" + userId;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        return Long.parseLong(user.getName());
    }
}