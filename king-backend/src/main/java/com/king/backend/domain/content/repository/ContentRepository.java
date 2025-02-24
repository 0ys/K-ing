package com.king.backend.domain.content.repository;

import com.king.backend.domain.content.entity.Content;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {

    @Query("SELECT c FROM Content c JOIN ContentKo ck ON c.id = ck.content.id WHERE ck.title = :title")
    Optional<Content> findByTitle(@Param("title") String title);

    @Query("SELECT c FROM Content c JOIN ContentKo ck ON c.id = ck.content.id WHERE LOWER(ck.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Content> findByTitleContainingIgnoreCase(@Param("title") String title);
}
