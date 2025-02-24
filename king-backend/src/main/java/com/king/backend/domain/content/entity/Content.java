package com.king.backend.domain.content.entity;

import com.king.backend.domain.place.entity.PlaceContent;
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
@EntityListeners(ContentListener.class)
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // drama, movie, show

    private String broadcast;

    private OffsetDateTime createdAt;

    private String imageUrl;

    @Column(nullable = false)
    private Integer tmdbId;

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlaceContent> placeContents;

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContentCast> contentCasts;

    // 1:1 관계 - 한국어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentKo translationKo;

    // 1:1 관계 - 영어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentEn translationEn;

    // 1:1 관계 - 일본어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentJa translationJa;

    // 1:1 관계 - 중국어 번역
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContentZh translationZh;

    public ContentTranslation getTranslation(String language) {
        if("ko".equalsIgnoreCase(language)) {
            return translationKo;
        } else if("en".equalsIgnoreCase(language)) {
            return translationEn;
        } else if("zh".equalsIgnoreCase(language)) {
            return translationZh;
        } else if("ja".equalsIgnoreCase(language)) {
            return translationJa;
        } else {
            return translationEn;
        }
    }
}