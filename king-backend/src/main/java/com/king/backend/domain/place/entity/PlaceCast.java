package com.king.backend.domain.place.entity;

import com.king.backend.domain.cast.entity.Cast;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceCast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @ManyToOne
    @JoinColumn(name = "cast_id", nullable = false)
    private Cast cast;

    @Column(columnDefinition = "TEXT")
    private String description;
}
