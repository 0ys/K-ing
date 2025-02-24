package com.king.backend.domain.post.repository;

import com.king.backend.domain.post.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    void deleteByPostId(Long postId);
    List<Like> findByPostId(Long postId);
}
