package com.king.backend.domain.favorite.repository;

import com.king.backend.domain.favorite.entity.Favorite;
import com.king.backend.domain.user.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserAndTypeAndTargetId(User user, String type, Long targetId);
    Optional<Favorite> findByUserAndTypeAndTargetId(User user, String type, Long targetId);
    List<Favorite> findByUserAndTypeOrderByCreatedAtDesc(User user, String type, Pageable pageable);
    List<Favorite> findByUserAndTypeAndIdLessThanOrderByCreatedAtDesc(User user, String type, Long lastId, Pageable pageable);

    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId AND CONCAT(UPPER(f.type), '_', f.targetId) IN :targetKeys")
    List<Favorite> findByUserIdAndTargetKeyIn(@Param("userId") Long userId, @Param("targetKeys") Set<String> targetKeys);
}
