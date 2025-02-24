package com.king.backend.domain.fcm.entity;

import com.king.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FcmToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @UpdateTimestamp
    private OffsetDateTime lastUpdateTime;

    @Builder
    public FcmToken(String token, User user) {
        this.token = token;
        this.user = user;
    }
}
