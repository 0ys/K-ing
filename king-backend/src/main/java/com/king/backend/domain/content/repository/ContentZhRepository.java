package com.king.backend.domain.content.repository;

import com.king.backend.domain.content.entity.ContentZh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentZhRepository extends JpaRepository<ContentZh, Integer> {
}
