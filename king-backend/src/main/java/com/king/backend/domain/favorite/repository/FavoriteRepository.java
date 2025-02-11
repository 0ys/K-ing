package com.king.backend.domain.favorite.repository;

import com.king.backend.domain.favorite.entity.Favorite;
import com.king.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserAndTypeAndTargetId(User user, String type, Long targetId);
    Optional<Favorite> findByUserAndTypeAndTargetId(User user, String type, Long targetId);
    List<Favorite> findByUserAndTypeOrderByCreatedAtDesc(User user, String type);
}
