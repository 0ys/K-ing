package com.king.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@Table(name = "user")
@SQLDelete(sql = "UPDATE user SET status = 'ROLE_DELETED' WHERE id = ?")
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(unique = true)
    private String nickname;

    @Column(nullable = false)
    private String imageUrl;

    private String googleId;
    private String lineId;

    @CreatedDate
    private LocalDateTime createdAt;

    private String description;
    private Boolean contentAlarmOn;
    private String language;

    @Column(nullable = false)
    private String status;
}
