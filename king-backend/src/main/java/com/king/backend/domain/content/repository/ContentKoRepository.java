package com.king.backend.domain.content.repository;

import com.king.backend.domain.content.entity.ContentKo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentKoRepository extends JpaRepository<ContentKo, Integer> {
}
