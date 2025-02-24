package com.king.backend.ai.repository;

import com.king.backend.ai.dto.ChatHistory;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatHistory c WHERE c.userId = :userId")
    void deleteByUserId(Long userId);
}
