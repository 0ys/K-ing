package com.king.backend.domain.place.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@EntityListeners(PlaceListener.class)
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String description;

    private String openHour;

    private String breakTime;

    private String closedDay;

    private String address;

    @Column(nullable = false)
    private float lat;

    @Column(nullable = false)
    private float lng;

    private String phone;

    private String imageUrl;

    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private Long view = 0L; // 기본값 설정

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<PlaceContent> placeContents;

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<PlaceCast> placeCasts;

}
