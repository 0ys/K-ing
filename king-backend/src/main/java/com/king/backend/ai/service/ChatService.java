package com.king.backend.ai.service;

import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.util.AuthUtil;
import com.king.backend.ai.util.ChatPromptGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatHistoryService chatHistoryService;
    private final OpenAiChatModel chatModel;

    public List<ChatHistory> getChatHistory() {
        return chatHistoryService.findByUserId(AuthUtil.getUserId());
    }

    public void deleteChatHistory() {
        chatHistoryService.deleteByUserId(AuthUtil.getUserId());
    }

    public void saveChatHistory(ChatHistory chatHistory) {
        chatHistoryService.saveChatHistory(AuthUtil.getUserId(), chatHistory.getRole(), chatHistory.getContent(), chatHistory.getType());
    }

    // 🎯 논리적 챗봇 스트리밍 응답 (Chat T)
    public Flux<String> streamChatT(String userMessage, String userId) {
        return streamChat(userMessage, userId, ChatPromptGenerator::generateChatTPrompt);
    }

    // 🎯 감성적 챗봇 스트리밍 응답 (Chat F)
    public Flux<String> streamChatF(String userMessage, String userId) {
        return streamChat(userMessage, userId, ChatPromptGenerator::generateChatFPrompt);
    }

    // 🔹 OpenAI API 스트리밍 방식 호출
    public Flux<String> streamChat(String userMessage, String userId, Function<List<Map<String, String>>, String> promptGenerator) {
        List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(Long.valueOf(userId));
        List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

        // 🔹 사용자 메시지 저장
        chatHistoryService.saveChatHistory(Long.valueOf(userId), "user", userMessage, "message");
        dialogueHistory.add(Map.of("role", "user", "content", userMessage));

        // 🔹 OpenAI 프롬프트 생성
        String prompt = promptGenerator.apply(dialogueHistory);
        log.info("prompt: {}", prompt);

        StringBuilder responseBuffer = new StringBuilder();

        // 🔹 OpenAI 스트리밍 호출 (Flux<String> 반환)
        Flux<String> responseStream = chatModel.stream(new Prompt(new UserMessage(prompt),
                        OpenAiChatOptions.builder()
                                .model("gpt-4o-mini")
                                .temperature(0.7)
                                .streamUsage(true)  // 🚀 스트리밍 활성화
                                .build()))
                .flatMap(chatResult -> {
                    if (chatResult == null) {
                        log.warn("⚠️ chatResult is null");
                        return Flux.empty();
                    }

                    var result = chatResult.getResult();
                    if (result == null || result.getOutput() == null) {
                        log.warn("⚠️ chatResult.getResult() or result.getOutput() is null");
                        return Flux.empty();
                    }

                    String text = result.getOutput().getText();
                    if (text == null || text.isEmpty()) {
                        log.warn("⚠️ AI Response is empty or null");
                        return Flux.empty();
                    }

                    //log.info("📝 AI Response: {}", text);
                    return Flux.just(text);
                })

                .doOnNext(responseBuffer::append)  // 🔹 전체 응답을 누적
                .doOnComplete(() -> {
                    Mono.fromRunnable(() -> {
                                chatHistoryService.saveChatHistory(Long.valueOf(userId), "assistant", responseBuffer.toString(), "message");
                                log.info("✅ Streaming Complete - Chat History Saved");
                            })
                            .subscribeOn(Schedulers.boundedElastic()) // ✅ 블로킹 작업을 별도의 스레드에서 실행
                            .subscribe();
                })


                .onErrorResume(e -> {
                    log.error("❌ Streaming Error: {}", e.getMessage(), e);
                    return Flux.just("Error occurred during streaming: " + e.getMessage());
                });

        return responseStream;
    }

    private List<Map<String, String>> convertChatHistoryToDialogueHistory(List<ChatHistory> chatHistoryList) {
        return chatHistoryList.stream()
                .filter(chat -> "message".equals(chat.getType()))
                .map(chat -> Map.of("role", chat.getRole(), "content", chat.getContent()))
                .collect(Collectors.toList());
    }

    /*REST API chat
    public Map<String, Object> chatT(String userMessage, String userId) {
        return chat(userMessage, userId, ChatPromptGenerator::generateChatTPrompt);
    }

    public Map<String, Object> chatF(String userMessage, String userId) {
        return chat(userMessage, userId, ChatPromptGenerator::generateChatFPrompt);
    }

    public Map<String, Object> chat(String userMessage, String userId, java.util.function.Function<List<Map<String, String>>, String> promptGenerator) {
        List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(Long.valueOf(userId));
        List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

        chatHistoryService.saveChatHistory(Long.valueOf(userId), "user", userMessage, "message");
        dialogueHistory.add(Map.of("role", "user", "content", userMessage));

        String prompt = promptGenerator.apply(dialogueHistory);
        ChatResponse chatResponse = chatModel.call(new Prompt(new UserMessage(prompt),
                OpenAiChatOptions.builder().model("gpt-4o-mini").temperature(0.7).build()));

        String gptResponse = chatResponse.getResults().get(0).getOutput().getText();
        chatHistoryService.saveChatHistory(Long.valueOf(userId), "assistant", gptResponse, "message");

        return Map.of("message", gptResponse);
    }
     */
}
