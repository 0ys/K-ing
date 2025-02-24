package com.king.backend.domain.user.service;

import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.dto.request.PatchUserRequestDTO;
import com.king.backend.domain.user.dto.response.UserProfileResponseDTO;
import com.king.backend.domain.user.entity.TokenEntity;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.domain.user.util.UserUtil;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import com.king.backend.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final S3Service s3Service;
    private final JWTUtil jwtUtil;

    @Value("${spring.jwt.accesstoken-expires-in}")
    private Long ACCESSTOKEN_EXPIRES_IN;

    @Value("${spring.jwt.refreshtoken-expires-in}")
    private Long REFRESHTOKEN_EXPIRES_IN;

    public UserProfileResponseDTO getUserById(String id) {
        long userId;
        try {
            userId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new CustomException(UserErrorCode.USER_NOT_FOUND);
        }

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long requestUserId = Long.parseLong(authUser.getName());

        if (userId == requestUserId) {
            return UserProfileResponseDTO.fromSelfEntity(user);
        }

        return UserProfileResponseDTO.fromEntity(user);
    }

    public ResponseEntity<ApiResponse<Void>> deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();

        Long userId = Long.parseLong(authUser.getName());

        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
        tokenRepository.deleteById(userId);


        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", null)
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).headers(headers).body(ApiResponse.success(null));
    }

    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> patchUser(PatchUserRequestDTO userRequestDTO, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(authUser.getName());
        User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if (userRequestDTO.getNickname() != null) {
            String nickname = userRequestDTO.getNickname().trim();

            if (!UserUtil.isValidNickname(nickname)) {
                throw new CustomException(UserErrorCode.INVALID_NICKNAME);
            }

            userRepository.findByNickname(nickname)
                    .ifPresent((findUser) -> {
                        if (!findUser.getId().equals(userId)) {
                            throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                        }
                    });

            user.setNickname(nickname);
        }

        if (userRequestDTO.getLanguage() != null) {
            String language = userRequestDTO.getLanguage();

            if (!UserUtil.isValidLanguage(language)) {
                throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
            }

            user.setLanguage(language);
        }

        if (userRequestDTO.getDescription() != null) {
            String description = userRequestDTO.getDescription();

            if (!UserUtil.isValidDescription(description)) {
                throw new CustomException(UserErrorCode.INVALD_VALUE);
            }

            user.setDescription(description);
        }

        if (userRequestDTO.getContentAlarmOn() != null) {
            user.setContentAlarmOn(userRequestDTO.getContentAlarmOn());
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.uploadFile(user, imageFile);
            user.setImageUrl(imageUrl);
        }

        userRepository.save(user);

        String accessToken = jwtUtil.createJwt("accessToken", userId.toString(), user.getLanguage(), "ROLE_REGISTERED", ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId.toString(), user.getLanguage(), "ROLE_REGISTERED", REFRESHTOKEN_EXPIRES_IN);

        tokenRepository.deleteById(userId);
        tokenRepository.save(new TokenEntity(userId, refreshToken, REFRESHTOKEN_EXPIRES_IN));

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(REFRESHTOKEN_EXPIRES_IN)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.status(HttpStatus.OK).headers(headers).body(ApiResponse.success(UserProfileResponseDTO.fromSelfEntity(user)));
    }
}
