package com.king.backend.domain.content.repository;

import com.king.backend.domain.content.entity.ContentJa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentJaRepository extends JpaRepository<ContentJa, Integer> {
}