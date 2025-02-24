package com.king.backend.domain.cast.repository;

import com.king.backend.domain.cast.entity.Cast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CastRepository extends JpaRepository<Cast, Long> {
    Optional<Cast> findByTmdbId(Integer tmdbId);
}
