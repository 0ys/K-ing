package com.king.backend.ai.service;

import com.king.backend.ai.dto.*;
import com.king.backend.ai.util.AuthUtil;
import com.king.backend.ai.util.ChatPromptGenerator;
import com.king.backend.ai.util.JsonUtil;
import com.king.backend.ai.util.SearchResultFormatter;
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
            if (response.isRecommend()) {
                if ("CURATION".equals(response.getType())) {
                    // 🟢 큐레이션 검색 수행
                    CurationSearchResponseDto searchResults = searchCurationsInElasticSearch(response.getKeyword());

                    if (searchResults != null && !searchResults.getCurations().isEmpty()) {
                        log.info("✅ 큐레이션 검색 결과 존재!");
                        retrievalData.put("data", SearchResultFormatter.formatCurationSearchResultsForAI(searchResults));
                    } else {
                        retrievalData.put("data", "데이터베이스에 관련된 정보가 없습니다.");
                    }

                } else {
                    // 🟢 장소 검색 수행
                    PlaceSearchResponseDto searchResults = searchPlacesInElasticSearch(response.getType(), response.getKeyword());

                    if (searchResults != null && !searchResults.getPlaces().isEmpty()) {
                        log.info("✅ 장소 검색 결과 존재!");
                        retrievalData.put("data", SearchResultFormatter.formatPlaceSearchResultsForAI(searchResults));
                    } else {
                        retrievalData.put("data", "데이터베이스에 관련된 정보가 없습니다.");
                    }
                }
            }

            // ✅ 4. 대화 요약 저장
            retrievalData.put("summary", response.getSummary());

        }
        // 전체 대화 내역 넣어 말어
        StringBuilder sb = new StringBuilder();
        for (Map<String, String> message : dialogueHistory) {
            sb.append(message.get("role")).append(": ").append(message.get("content")).append("\n");
        }
        retrievalData.put("history", sb.toString());

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
                    if (chatResult == null || chatResult.getResult() == null || chatResult.getResult().getOutput() == null) {
                        log.warn("⚠️ chatResult is null or empty");
                        return Flux.empty();
                    }

                    String text = chatResult.getResult().getOutput().getText();
                    return text == null || text.isEmpty() ? Flux.empty() : Flux.just(text);
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

    public PlaceSearchResponseDto searchPlacesInElasticSearch(String type, String keyword) {
        log.info("🔍 Elasticsearch에서 '{}' 키워드로 장소 검색 수행...", keyword);

        RagSearchRequestDto requestDto = new RagSearchRequestDto(type, keyword);
        PlaceSearchResponseDto placeSearchResults = ragSearchService.search(requestDto);

        if (placeSearchResults != null && !placeSearchResults.getPlaces().isEmpty()) {
            log.info("✅ 장소 검색 성공! 총 {}개의 장소가 검색됨", placeSearchResults.getPlaces().size());
            placeSearchResults.getPlaces().forEach(place ->
                    log.info("   - 장소 이름: {}, 장소 ID: {}, 카테고리: {}", place.getName(), place.getPlaceId(), place.getType())
            );
        } else {
            log.info("⚠️ 장소 검색 결과 없음");
        }

        return placeSearchResults;
    }

    public CurationSearchResponseDto searchCurationsInElasticSearch(String keyword) {
        log.info("🔍 Elasticsearch에서 '{}' 키워드로 큐레이션 검색 수행...", keyword);

        RagSearchRequestDto requestDto = new RagSearchRequestDto("CURATION", keyword);
        CurationSearchResponseDto curationSearchResults = ragSearchService.searchCurations(requestDto);

        if (curationSearchResults != null && !curationSearchResults.getCurations().isEmpty()) {
            log.info("✅ 큐레이션 검색 성공! 총 {}개의 큐레이션이 검색됨", curationSearchResults.getCurations().size());
            curationSearchResults.getCurations().forEach(curation ->
                    log.info("   - 큐레이션 제목: {}, 큐레이션 ID: {}", curation.getTitle(), curation.getCurationId())
            );
        } else {
            log.info("⚠️ 큐레이션 검색 결과 없음");
        }

        return curationSearchResults;
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
