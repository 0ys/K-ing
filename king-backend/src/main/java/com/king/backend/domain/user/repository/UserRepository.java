package com.king.backend.domain.user.repository;

import com.king.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByGoogleIdAndStatusIn(String googleId, List<String> statuses);
    User findByLineIdAndStatusIn(String lineId, List<String> statuses);
    Optional<User> findByNickname(String nickname);
    Optional<User> findByIdAndStatus(Long id, String status);
}
