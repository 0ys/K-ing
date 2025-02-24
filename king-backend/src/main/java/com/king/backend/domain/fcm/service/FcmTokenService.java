package com.king.backend.domain.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.fcm.entity.FcmToken;
import com.king.backend.domain.fcm.repository.FcmTokenRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.translate.TranslateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmTokenService {
    @Value("${client.url}")
    private String CLIENT_URL;

    private final FcmTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;
    private final CurationListRepository curationListRepository;
    private final TranslateService translateService;

    public void registerToken(String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        fcmTokenRepository.findByUserAndToken(user, token)
                .ifPresentOrElse(existing -> {
                    // 존재하면 업데이트 시각만 변경
                }, () -> {
                    FcmToken newToken = FcmToken.builder()
                            .user(user)
                            .token(token)
                            .build();
                    fcmTokenRepository.save(newToken);
                });
    }

    public String sendMessageByToken(String token, String title, String body, String link) throws FirebaseMessagingException {
        log.info("link : {}", link);
        Message message = Message.builder()
                .setToken(token)
                .putData("title", title)
                .putData("body", body)
                .putData("link",link)
                // .setWebpushConfig(
                //         WebpushConfig.builder()
                //                 .setFcmOptions(
                //                         WebpushFcmOptions.builder()
                //                                 .setLink(link)
                //                                 .build()
                //                 )
                //                 .build()
                // )
                .build();
        return FirebaseMessaging.getInstance().send(message);
    }

    public void deleteToken(String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Optional<FcmToken> tokenRecord = fcmTokenRepository.findByUserAndToken(user, token);
        tokenRecord.ifPresent(fcmTokenRepository::delete);
    }

//    @Scheduled(fixedRate = 60000, zone = "Asia/Seoul")
    @Scheduled(cron = "0 0 10,11,12,13,14,15,16,17 * * *", zone = "Asia/Seoul")
    public void testPushNotification() {
        Optional<CurationList> optionalCuration = curationListRepository.findTopByIsPublicTrueOrderByCreatedAtDesc();
        if (optionalCuration.isEmpty()) {
            log.info("공개 큐레이션이 존재하지 않습니다.");
            return;
        }
        CurationList latestCuration = optionalCuration.get();
        String link = CLIENT_URL +"/curation/" + latestCuration.getId();

        List<FcmToken> tokens = fcmTokenRepository.findByUser_ContentAlarmOnTrue();
        if (tokens.isEmpty()) {
            log.info("전송할 FCM 토큰이 없습니다.");
            return;
        }

        for (FcmToken token : tokens) {
            User user = token.getUser();
            String language = user.getLanguage();
            String title;
            String body;

            Map<String, String> originalText = new HashMap<>();
            String titleKey = "curation:" + latestCuration.getId() + ":" + language + ":title";
            originalText.put(titleKey, latestCuration.getTitle());
            Map<String, String> translatedText = translateService.getTranslatedText(originalText, language);

            if ("ko".equalsIgnoreCase(language)) {
                title = "큐레이션 추천 알림";
                body = "새로 업데이트된 \"" + translatedText.get(titleKey).trim() + "\" 큐레이션을 확인해 보세요!";
            } else if ("ja".equalsIgnoreCase(language)) {
                title = "キュレーション推薦通知";
                body = "新しく更新された \"" + translatedText.get(titleKey).trim() + "\" キュレーションをチェックしてください！";
            } else if ("zh".equalsIgnoreCase(language)) {
                title = "策展推荐提醒";
                body = "请查看最新更新的 \"" + translatedText.get(titleKey).trim() + "\" 策展！";
            } else {
                title = "Curation Recommendation Alert";
                body = "Check out the newly updated \"" + translatedText.get(titleKey).trim() + "\" curation!";
            }

            try {
                String responseId = sendMessageByToken(token.getToken(), title, body, link);
                log.info("토큰 {}: 알림 전송 성공 (메시지 ID: {})", token.getToken(), responseId);
            } catch (FirebaseMessagingException e) {
                log.error("토큰 {}: 알림 전송 실패 - {}", token.getToken(), e.getMessage());
            }
        }
    }
}
