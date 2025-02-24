package com.king.backend.search.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRanking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyword;

    @Column(nullable = false)
    private String period;

    @Column(name = "`rank`", nullable = false)
    private int rank;

    @Column(name = "search_count", nullable = false)
    private int searchCount;

    private double score;

    @Column
    private LocalDateTime date;

}
