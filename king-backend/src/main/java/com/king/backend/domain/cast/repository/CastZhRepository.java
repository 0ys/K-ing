package com.king.backend.domain.cast.repository;

import com.king.backend.domain.cast.entity.CastZh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CastZhRepository extends JpaRepository<CastZh, Integer> {
}
