package com.king.backend.domain.content.repository;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.entity.ContentCast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentCastRepository extends JpaRepository<ContentCast, Long> {
    Optional<ContentCast> findByContentAndCast(Content content, Cast cast);
}
