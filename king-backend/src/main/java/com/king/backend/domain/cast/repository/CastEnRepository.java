package com.king.backend.domain.cast.repository;

import com.king.backend.domain.cast.entity.CastEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CastEnRepository extends JpaRepository<CastEn, Long> {
}
