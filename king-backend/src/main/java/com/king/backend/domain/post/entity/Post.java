package com.king.backend.domain.post.entity;

import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Getter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private boolean isPublic;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name="user_id", nullable=false)
    private User writer;

    @ManyToOne
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    public void update(String content, Place place, Boolean isPublic) {
        if (content != null) {
            this.content = content;
        }
        if (place != null) {
            this.place = place;
        }
        if (isPublic != null) {
            this.isPublic = isPublic;
        }
    }
}