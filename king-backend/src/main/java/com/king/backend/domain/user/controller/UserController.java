package com.king.backend.domain.user.controller;

import com.king.backend.domain.user.dto.request.PatchUserRequestDTO;
import com.king.backend.domain.user.dto.request.SignUpRequestDTO;
import com.king.backend.domain.user.dto.response.NicknameResponseDTO;
import com.king.backend.domain.user.dto.response.UserProfileResponseDTO;
import com.king.backend.domain.user.dto.response.SignUpResponseDTO;
import com.king.backend.domain.user.entity.TokenEntity;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.jwt.JWTUtil;
import com.king.backend.domain.user.repository.TokenRepository;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.domain.user.service.TokenService;
import com.king.backend.domain.user.service.UserService;
import com.king.backend.domain.user.util.UserUtil;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "유저", description = "유저 가입, 로그인, 토큰 관리, 유저 정보 조회 및 수정")
public class UserController {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final TokenService tokenService;
    private final TokenRepository tokenRepository;
    private final UserService userService;

    @Value("${spring.jwt.accesstoken-expires-in}")
    private Long ACCESSTOKEN_EXPIRES_IN;

    @Value("${spring.jwt.refreshtoken-expires-in}")
    private Long REFRESHTOKEN_EXPIRES_IN;

    @Operation(summary = "refreshToken(cookie)로 accessToken 재발급")
    @PostMapping("/token-refresh")
    public ResponseEntity<ApiResponse<Void>> tokenRefresh(@CookieValue(value = "refreshToken", required = false) String oldRefreshToken) {
        if (oldRefreshToken == null) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        try {
            jwtUtil.validToken(oldRefreshToken);
        } catch (Exception e) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        if (!jwtUtil.getType(oldRefreshToken).equals("refreshToken")) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        String userId = jwtUtil.getUserId(oldRefreshToken);
        String language = jwtUtil.getLanguage(oldRefreshToken);
        String role = jwtUtil.getRole(oldRefreshToken);

        Optional<TokenEntity> token = tokenService.findTokenById(Long.parseLong(userId));
        if (token.isEmpty() || !token.get().getRefreshToken().equals(oldRefreshToken)) {
            throw new CustomException(UserErrorCode.INVALID_TOKEN);
        }

        String accessToken = jwtUtil.createJwt("accessToken", userId, language, role, ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId, language, role, REFRESHTOKEN_EXPIRES_IN);

        tokenRepository.deleteById(Long.parseLong(userId));
        tokenRepository.save(new TokenEntity(Long.parseLong(userId), refreshToken, REFRESHTOKEN_EXPIRES_IN));

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(REFRESHTOKEN_EXPIRES_IN)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.status(HttpStatus.OK).headers(headers).body(ApiResponse.success(null));
    }

    @Operation(summary = "닉네임 등록 및 가입")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignUpResponseDTO>> signup(@RequestBody SignUpRequestDTO signUpRequestDTO) {
        String nickname = signUpRequestDTO.getNickname();
        if (!UserUtil.isValidNickname(nickname)) {
            throw new CustomException(UserErrorCode.INVALID_NICKNAME);
        }
        nickname = nickname.trim();

        userRepository.findByNickname(nickname)
                .ifPresent((user) -> {
                    throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                });

        String language = signUpRequestDTO.getLanguage();
        if (!UserUtil.isValidLanguage(signUpRequestDTO.getLanguage())) {
            throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long userId = Long.parseLong(authentication.getName());

        User findUser = userRepository.findByIdAndStatus(userId, "ROLE_PENDING")
                .orElseThrow(() -> new CustomException(UserErrorCode.NOT_PENDING_USER));

        findUser.setNickname(nickname);
        findUser.setLanguage(language);
        findUser.setCreatedAt(LocalDateTime.now());
        findUser.setContentAlarmOn(true);
        findUser.setStatus("ROLE_REGISTERED");

        userRepository.save(findUser);

        String accessToken = jwtUtil.createJwt("accessToken", userId.toString(), language, "ROLE_REGISTERED", ACCESSTOKEN_EXPIRES_IN);
        String refreshToken = jwtUtil.createJwt("refreshToken", userId.toString(), language, "ROLE_REGISTERED", REFRESHTOKEN_EXPIRES_IN);

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

        SignUpResponseDTO responseDTO = new SignUpResponseDTO();
        responseDTO.setUserId(findUser.getId());
        responseDTO.setEmail(findUser.getEmail());
        responseDTO.setNickname(findUser.getNickname());
        responseDTO.setImageUrl(findUser.getImageUrl());
        responseDTO.setLanguage(findUser.getLanguage());

        return ResponseEntity.status(HttpStatus.CREATED).headers(headers).body(ApiResponse.success(responseDTO));
    }

    @Operation(summary = "닉네임 중복 조회")
    @GetMapping("/nickname")
    public ResponseEntity<ApiResponse<NicknameResponseDTO>> getNicknameDuplication(@RequestParam(value = "nickname", required = false) String nickname) {
        if (!UserUtil.isValidNickname(nickname)) {
            throw new CustomException(UserErrorCode.INVALID_NICKNAME);
        }
        nickname = nickname.trim();

        userRepository.findByNickname(nickname)
                .ifPresent((user) -> {
                    throw new CustomException(UserErrorCode.DUPLICATED_NICKNAME);
                });

        NicknameResponseDTO response = new NicknameResponseDTO();
        response.setNickname(nickname);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(response));
    }

    @Operation(summary = "유저 정보 조회")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> getUserProfile(@PathVariable(value = "userId") String userId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(userService.getUserById(userId)));
    }

    @Operation(summary = "현재 로그인된 유저 탈퇴")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteUser() {
        return userService.deleteUser();
    }

    @Operation(summary = "유저 정보 수정")
    @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponseDTO>> patchUser(
            @RequestPart(value = "user") PatchUserRequestDTO patchUserRequestDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        return userService.patchUser(patchUserRequestDTO, imageFile);
    }
}
