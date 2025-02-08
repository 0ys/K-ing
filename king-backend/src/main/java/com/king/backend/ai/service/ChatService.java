package com.king.backend.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.king.backend.ai.dto.ChatHistory;
import com.king.backend.ai.dto.ChatSummary;
import com.king.backend.ai.dto.RagSearchRequestDto;
import com.king.backend.ai.dto.RagSearchResponseDto;
import com.king.backend.ai.util.AuthUtil;
import com.king.backend.ai.util.ChatPromptGenerator;
import com.king.backend.ai.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatHistoryService chatHistoryService;
    private final OpenAiChatModel chatModel;
    private final RagSearchService ragSearchService;
    private static final ObjectMapper objectMapper = new ObjectMapper();

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
    public Flux<String> streamChat(String userMessage, String userId, Function<Map<String, String>, String> promptGenerator) {
        List<ChatHistory> chatHistoryList = chatHistoryService.findByUserId(Long.valueOf(userId));
        List<Map<String, String>> dialogueHistory = convertChatHistoryToDialogueHistory(chatHistoryList);

        // 🔹 사용자 메시지 저장
        chatHistoryService.saveChatHistory(Long.valueOf(userId), "user", userMessage, "message");
        dialogueHistory.add(Map.of("role", "user", "content", userMessage));

        // ✅ 1. OpenAI를 사용하여 JSON 요약 생성
        String json = summary(dialogueHistory, ChatPromptGenerator::generatePrompt);
        log.info("📌 생성된 JSON: " + json);

        // ✅ 2. JSON 유효성 검사 수행
        ChatSummary response = JsonUtil.validateJson(json);
        Map<String, String> retrievalData = new HashMap<>();

        if (response != null) {
            log.info("✅ JSON이 유효합니다!");
            //System.out.println(response);  // DTO 전체 출력

            // ✅ 3. Elasticsearch 검색 수행 (추천이 필요할 경우)
            RagSearchResponseDto searchResults = null;
            if (response.isRecommend()) {
                searchResults = searchInElasticSearch(response.getType(), response.getKeyword());
                printSearchResults(searchResults);
            }

            // ✅ 4. Retrieval Data 저장
            retrievalData.put("summary", response.getSummary());

            // ✅ 검색된 데이터가 있을 경우, data 추가
            if (searchResults != null && searchResults.getPlaces() != null && !searchResults.getPlaces().isEmpty()) {
                retrievalData.put("data", searchResults.toString()); // JSON 또는 텍스트 변환
            }

        } else {
            // ❌ JSON이 유효하지 않다면 `summary` 대신 `dialogueHistory`를 사용
            log.info("❌ JSON이 유효하지 않습니다. Retrieval Data에 대화 내역을 사용합니다.");
            retrievalData.put("summary", userMessage);
        }

        // 🔹 OpenAI 프롬프트 생성
        String prompt = promptGenerator.apply(retrievalData);
        log.info("🔹 OpenAI Prompt 생성: {}", prompt);

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

    public String summary(List<Map<String, String>> dialogueHistory, Function<List<Map<String, String>>, String> promptGenerator) {
        String prompt = promptGenerator.apply(dialogueHistory);
        ChatResponse chatResponse = chatModel.call(new Prompt(new UserMessage(prompt),
                OpenAiChatOptions.builder().model("gpt-4o-mini").temperature(0.7).build()));

        String gptResponse = chatResponse.getResults().get(0).getOutput().getText();

        return gptResponse;
    }

    public RagSearchResponseDto searchInElasticSearch(String type, String keyword) {
        log.info("🔍 Elasticsearch에서 '" + keyword + "' 키워드로 장소 검색 수행...");

        // 요청 DTO 생성
        RagSearchRequestDto requestDto = new RagSearchRequestDto(type, keyword);
        return ragSearchService.search(requestDto);
    }

    public static void printSearchResults(RagSearchResponseDto searchResults) {
        if (searchResults != null && searchResults.getPlaces() != null && !searchResults.getPlaces().isEmpty()) {
            System.out.print("🔍 검색된 장소 목록:");
//            for (RagSearchResponseDto.PlaceResult place : searchResults.getPlaces()) {
//                System.out.println("📍 장소 ID: " + place.getPlaceId());
//                System.out.println("   이름: " + place.getName());
//                System.out.println("   유형: " + place.getType());
//                System.out.println("   주소: " + place.getAddress());
//                System.out.println("   설명: " + place.getDescription());
//                System.out.println("   위치: (" + place.getLat() + ", " + place.getLng() + ")");
//                System.out.println("   이미지: " + place.getImageUrl());
//                System.out.println("---------------------------------");
//            }
            System.out.println(searchResults.getPlaces().size());
        } else {
            System.out.println("❌ 검색된 장소가 없습니다.");
        }
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
