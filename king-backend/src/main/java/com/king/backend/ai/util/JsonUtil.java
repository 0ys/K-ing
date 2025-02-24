package com.king.backend.ai.util;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.king.backend.ai.dto.ChatSummary;

public class JsonUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)  // 예상하지 못한 필드가 있어도 무시
            .configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true) // 단일 값도 배열로 처리 가능
            .configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false); // null이 boolean 등에 들어가도 허용

    /**
     * JSON이 ChatSummary 객체로 변환 가능한지 확인하는 함수
     *
     * @param json 유효성을 검사할 JSON 문자열
     * @return ChatSummary 객체 (유효하면 반환, 유효하지 않으면 null 반환)
     */
    public static ChatSummary validateJson(String json) {
        try {
            // 백틱과 불필요한 개행 문자 제거
            String cleanedJson = json.replaceAll("```json|```", "").trim();
            return objectMapper.readValue(cleanedJson, ChatSummary.class);
        } catch (JsonProcessingException e) {
            System.out.println("JSON이 유효하지 않습니다: " + e.getMessage());
            return null;
        }
    }
}


