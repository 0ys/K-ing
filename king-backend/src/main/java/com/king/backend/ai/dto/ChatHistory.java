package com.king.backend.ai.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime created;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 255)
    private String type;

    public ChatHistory(Long userId, String role, String content, String type) {
        this.userId = userId;
        this.role = role;
        this.content = content;
        this.type = type;
    }

    // 저장 전 자동으로 created 값 설정
    @PrePersist
    protected void onCreate() {
        this.created = OffsetDateTime.now();
    }
}
