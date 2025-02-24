package com.king.backend.ai.controller;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "AI", description = "chatGPT 챗봇 API")
@RequestMapping("/chatbot")
public class AIController {
    private final ChatService chatService;

    @MessageMapping("/message")
    @SendTo("/topic/messages")
    public String sendMessage(String message) {
        return "Server: " + message;
    }

    @Operation(summary = "챗봇 대화 기록 조회")
    @GetMapping("/")
    public ResponseEntity<List<ChatHistory>> getChatHistory() {
        return ResponseEntity.ok(chatService.getChatHistory());
    }

    @Operation(summary = "챗봇 대화 기록 삭제")
    @DeleteMapping("/")
    public ResponseEntity<String> deleteChatHistory() {
        chatService.deleteChatHistory();
        return ResponseEntity.ok("대화 기록이 삭제되었습니다.");
    }

    @Operation(summary = "챗봇 대화 내용 저장")
    @PostMapping("/save")
    public ResponseEntity<String> saveChatHistory(@RequestBody ChatHistory chatHistory) {
        chatService.saveChatHistory(chatHistory);
        return ResponseEntity.ok("대화 기록이 저장되었습니다.");
    }

    /*REST API chat >> WebSocket 쪽으로 바꿈
    @Operation(summary = "AI 챗봇과 T 대화", description = "사용자가 입력한 메시지를 기반으로 AI 챗봇이 논리적으로 응답을 생성합니다.")
    @PostMapping("/chatT")
    public ResponseEntity<Map<String, Object>> chatT(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "사용자가 입력한 메시지", required = true, content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{ \"userMessage\": \"안녕!\" }")
            ))
            @RequestBody Map<String, String> requestBody) {
        try {
            String userMessage = requestBody.get("userMessage");
            return ResponseEntity.ok(chatService.chatT(userMessage));
        } catch (Exception e) {
            log.error("Error occurred in /chatT endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "AI 챗봇과 F 대화", description = "사용자가 입력한 메시지를 기반으로 AI 챗봇이 감성적으로 응답을 생성합니다.")
    @PostMapping("/chatF")
    public ResponseEntity<Map<String, Object>> chatF(@RequestBody Map<String, String> requestBody) {
        try {
            String userMessage = requestBody.get("userMessage");
            return ResponseEntity.ok(chatService.chatF(userMessage));
        } catch (Exception e) {
            log.error("Error occurred in /chatF endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
     */

}
