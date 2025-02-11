package com.king.backend.domain.curation.service;

import com.king.backend.domain.curation.dto.request.BookmarkRequestDTO;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListBookmark;
import com.king.backend.domain.curation.errorcode.CurationErrorCode;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final UserRepository userRepository;
    private final CurationListRepository curationListRepository;
    private final CurationListBookmarkRepository curationListBookmarkRepository;

    @Transactional
    public void postBookmark(BookmarkRequestDTO requestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        CurationList curationList = curationListRepository.findById(requestDTO.getCurationId())
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curationList.isPublic() && !curationList.getWriter().equals(user)) {
            throw new CustomException(CurationErrorCode.CURATION_NOT_FOUND);
        }

        if (curationListBookmarkRepository.existsByCurationListIdAndUserId(curationList.getId(), userId)) {
            throw new CustomException(CurationErrorCode.DUPLICATED_BOOKMARK);
        }

        CurationListBookmark curationListBookmark = new CurationListBookmark();
        curationListBookmark.setCreatedAt(LocalDateTime.now());
        curationListBookmark.setCurationList(curationList);
        curationListBookmark.setUser(user);

        curationListBookmarkRepository.save(curationListBookmark);
    }

    @Transactional
    public void deleteBookmark(BookmarkRequestDTO requestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        CurationList curationList = curationListRepository.findById(requestDTO.getCurationId())
                .orElseThrow(() -> new CustomException(CurationErrorCode.CURATION_NOT_FOUND));

        if (!curationList.isPublic() && !curationList.getWriter().equals(user)) {
            throw new CustomException(CurationErrorCode.CURATION_NOT_FOUND);
        }

        CurationListBookmark bookmark = curationListBookmarkRepository.findByCurationListAndUser(curationList, user)
                .orElseThrow(() -> new CustomException(CurationErrorCode.NOT_BOOKMARKED));

        curationListBookmarkRepository.delete(bookmark);
    }
}
