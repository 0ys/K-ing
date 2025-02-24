package com.king.backend.ai.service;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.repository.ChatHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {
    private final ChatHistoryRepository chatHistoryRepository;

    /**
     * 특정 사용자(userId)의 채팅 기록을 조회하는 메서드
     */
    public List<ChatHistory> findByUserId(Long userId) {
        return chatHistoryRepository.findByUserId(userId);
    }

    /**
     * 특정 사용자(userId)의 모든 채팅 기록을 삭제하는 메서드
     */
    @Transactional
    public void deleteByUserId(Long userId) {
        chatHistoryRepository.deleteByUserId(userId);
    }

    /**
     * 채팅 기록을 저장하는 메서드 (초기 메시지, 옵션 클릭, 추천 이동 포함)
     */
    @Transactional
    public void saveChatHistory(Long userId, String role, String content, String type) {
        ChatHistory chatHistory = new ChatHistory(userId, role, content, type);
        chatHistoryRepository.save(chatHistory);
    }
}



