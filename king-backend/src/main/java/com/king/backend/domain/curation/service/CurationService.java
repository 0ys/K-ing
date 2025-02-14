package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.CurationQueryRequestDTO;
import com.king.backend.domain.curation.dto.request.CurationRequestDTO;
import com.king.backend.domain.curation.dto.response.CurationDetailResponseDTO;
import com.king.backend.domain.curation.dto.response.CurationListResponseDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListItem;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListItemRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.util.TranslateUtil;
import com.king.backend.global.util.ValidationUtil;
import com.king.backend.s3.service.S3Service;
import com.king.backend.search.util.CursorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CurationService {
    private final CursorUtil cursorUtil;
    private final CurationListRepository curationListRepository;
    private final CurationListBookmarkRepository curationListBookmarkRepository;
    private final CurationListItemRepository curationListItemRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final PlaceRepository placeRepository;
    private final TranslateUtil translateUtil;

    @Transactional
    public CurationDetailResponseDTO getCurationDetail(Long curationListId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(user.getName());
        String language = user.getLanguage();

        CurationList curationList = curationListRepository.findById(curationListId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curationList.isPublic() && !curationList.getWriter().getId().equals(userId)) {
            throw new CustomException(CurationErrorCode.CURATION_NOT_FOUND);
        }

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curationListId, userId);

        List<Place> places = curationListItemRepository.findByCurationListId(curationListId)
                .stream()
                .map(CurationListItem::getPlace)
                .toList();

        CurationDetailResponseDTO response = CurationDetailResponseDTO.fromEntity(curationList, bookmarked, places);

        List<String> translation = translateUtil.translateText(List.of(new String[]{ response.getTitle(), response.getDescription()}), language);
        response.setTitle(translation.get(0));
        response.setDescription(translation.get(1));

        return response;
    }

    @Transactional
    public CurationListResponseDTO getCurations(CurationQueryRequestDTO requestDTO) {
        Long userId = requestDTO.getUserId();
        int size = Optional.ofNullable(requestDTO.getSize()).orElse(10);

        String cursor = requestDTO.getCursor();
        Long cursorId = (cursor != null) ? Long.parseLong(cursorUtil.decodeCursor(cursor).get(0).toString()) : null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long authId = Long.parseLong(authUser.getName());
        String language = authUser.getLanguage();

        Boolean isPublic = authId.equals(requestDTO.getUserId()) ? null : true;
        List<CurationList> curations = curationListRepository.searchCurations(
                userId,
                isPublic,
                cursorId,
                size,
                requestDTO.getBookmarked(),
                authId
        );

        String nextCursor = (curations.size() == size)
                ? cursorUtil.encodeCursor(List.of(curations.get(curations.size() - 1).getId()))
                : null;

        Set<Long> bookmarkedCurationIds = curationListBookmarkRepository.findCurationListIdByUserId(authId);

        CurationListResponseDTO response = CurationListResponseDTO.fromEntity(curations, bookmarkedCurationIds, nextCursor);
        List<CurationListResponseDTO.CurationDTO> curationDTOs = response.getCurations();

        List<String> originalText = curationDTOs.stream()
                        .map(CurationListResponseDTO.CurationDTO::getTitle)
                        .toList();

        List<String> translatedText = translateUtil.translateText(originalText, language);

        for (int i = 0; i < curationDTOs.size(); i++) {
            curationDTOs.get(i).setTitle(translatedText.get(i));
        }

        return response;
    }

    @Transactional
    public CurationDetailResponseDTO postCuration(CurationRequestDTO requestDTO, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if (!ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getTitle(), 50)
                || !ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getDescription(), 1000)
                || requestDTO.getPlaceIds().isEmpty()) {
            throw new CustomException(CurationErrorCode.INVALID_VALUE);
        }

        CurationList curation = new CurationList();
        String imageUrl = s3Service.uploadFile(curation, imageFile);
        curation.setTitle(requestDTO.getTitle());
        curation.setDescription(requestDTO.getDescription());
        curation.setPublic(requestDTO.isPublic());
        curation.setImageUrl(imageUrl);
        curation.setWriter(user);
        curation.setCreatedAt(OffsetDateTime.now());

        curationListRepository.save(curation);

        for (Long placeId : requestDTO.getPlaceIds()) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

            curationListItemRepository.findByCurationListAndPlace(curation, place)
                    .ifPresent((item) -> {
                        throw new CustomException(CurationErrorCode.DUPLICATED_PLACE);
                    });

            CurationListItem curationListItem = new CurationListItem();
            curationListItem.setCurationList(curation);
            curationListItem.setPlace(place);

            curationListItemRepository.save(curationListItem);
        }

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curation.getId(), userId);

        List<Place> places = curationListItemRepository.findByCurationListId(curation.getId())
                .stream()
                .map(CurationListItem::getPlace)
                .toList();

        return CurationDetailResponseDTO.fromEntity(curation, bookmarked, places);
    }

    @Transactional
    public CurationDetailResponseDTO putCuration(Long curationId, CurationRequestDTO requestDTO, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        CurationList curation = curationListRepository.findById(curationId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curation.getWriter().equals(user)) {
            throw new CustomException(CurationErrorCode.FORBIDDEN_CURATION);
        }

        if (!ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getTitle(), 50)
                || !ValidationUtil.checkNotNullAndLengthLimit(requestDTO.getDescription(), 1000)
                || requestDTO.getPlaceIds().isEmpty()) {
            throw new CustomException(CurationErrorCode.INVALID_VALUE);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.uploadFile(curation, imageFile);
            curation.setImageUrl(imageUrl);
        }
        curation.setTitle(requestDTO.getTitle());
        curation.setDescription(requestDTO.getDescription());
        curation.setPublic(requestDTO.isPublic());

        curationListRepository.save(curation);

        curationListItemRepository.deleteAllByCurationList(curation);

        for (Long placeId : requestDTO.getPlaceIds()) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

            curationListItemRepository.findByCurationListAndPlace(curation, place)
                    .ifPresent((item) -> {
                        throw new CustomException(CurationErrorCode.DUPLICATED_PLACE);
                    });

            CurationListItem curationListItem = new CurationListItem();
            curationListItem.setCurationList(curation);
            curationListItem.setPlace(place);

            curationListItemRepository.save(curationListItem);
        }

        boolean bookmarked = curationListBookmarkRepository.existsByCurationListIdAndUserId(curation.getId(), userId);

        List<Place> places = curationListItemRepository.findByCurationListId(curation.getId())
                .stream()
                .map(CurationListItem::getPlace)
                .toList();

        return CurationDetailResponseDTO.fromEntity(curation, bookmarked, places);
    }

    @Transactional
    public void deleteCuration(Long curationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        CurationList curation = curationListRepository.findById(curationId)
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curation.getWriter().equals(user)) {
            throw new CustomException(CurationErrorCode.FORBIDDEN_CURATION);
        }

        curationListBookmarkRepository.deleteAllByCurationList(curation);
        curationListItemRepository.deleteAllByCurationList(curation);
        curationListRepository.delete(curation);
    }
}
