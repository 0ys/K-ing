package com.king.backend.search.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CursorUtil {

    private final ObjectMapper objectMapper;

    /**
     * 정렬 값 목록을 Base64 인코딩된 커서 문자열로 변환
     *
     * @param sortValues 정렬 값 목록
     * @return 인코딩된 커서 문자열
     */
    public String encodeCursor(List<Object> sortValues) {
        try{
            String json = objectMapper.writeValueAsString(sortValues);
            return Base64.getEncoder().encodeToString(json.getBytes());
        } catch (JsonProcessingException e){
            throw new RuntimeException(e);
        }
    }

    /**
     * Base64 인코딩된 커서 문자열을 정렬 값 목록으로 변환
     *
     * @param cursor 인코딩된 커서 문자열
     * @return 정렬 값 목록
     */
    public List<Object> decodeCursor(String cursor) {
        try{
            byte[] decodeBytes = Base64.getDecoder().decode(cursor);
            String json = new String(decodeBytes);
            return objectMapper.readValue(json, List.class);
        }catch (Exception e){
            throw new IllegalArgumentException(e);
        }
    }
}
