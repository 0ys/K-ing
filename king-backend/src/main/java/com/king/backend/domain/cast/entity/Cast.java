package com.king.backend.domain.cast.entity;

import com.king.backend.domain.content.entity.ContentCast;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@EntityListeners(CastListener.class)
public class Cast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    private String birthDate;

    private Long participatingWork;

    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private Long tmdbId;

    @OneToMany(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContentCast> contentCasts;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastKo translationKo;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastEn translationEn;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastJa translationJa;

    @OneToOne(mappedBy = "cast", cascade = CascadeType.ALL, orphanRemoval = true)
    private CastZh translationZh;

    public CastTranslation getTranslation(String language) {
        if("ko".equalsIgnoreCase(language)) {
            return translationKo;
        } else if("en".equalsIgnoreCase(language)) {
            return translationEn;
        } else if ("zh".equalsIgnoreCase(language)) {
            return translationZh;
        } else if ("ja".equalsIgnoreCase(language)) {
            return translationJa;
        } else {
            return translationEn;
        }
    }
}
