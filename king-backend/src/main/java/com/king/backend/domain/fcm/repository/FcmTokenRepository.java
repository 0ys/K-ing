package com.king.backend.domain.fcm.repository;

import com.king.backend.domain.fcm.entity.FcmToken;
import com.king.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {
    List<FcmToken> findByUser(User user);
    Optional<FcmToken> findByUserAndToken(User user, String token);
    List<FcmToken> findByUser_ContentAlarmOnTrue();
}
