package com.king.backend.domain.cast.repository;

import com.king.backend.domain.cast.entity.CastJa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CastJaRepository extends JpaRepository<CastJa, Long> {
}
