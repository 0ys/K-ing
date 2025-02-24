package com.king.backend.global.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.king.backend.global.errorcode.RedisErrorCode;
import com.king.backend.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisUtil {
    private final RedisTemplate<String, String> redisStringTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisTemplate<String, byte[]> redisBinaryTemplate;
    private final ObjectMapper objectMapper;

    public void setValue(String key, String data, long time, TimeUnit timeUnit) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        values.set(key, data, time, timeUnit);
    }

    public String getValue(String key) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        return (String) values.get(key);
    }

    public List<String> getValues(List<String> keys) {
        List<String> values = redisStringTemplate.opsForValue().multiGet(keys);
        return values != null ? values : new ArrayList<>();
    }

    public void setValues(Map<String, String> values, long expirationTime, TimeUnit timeUnit) {
        redisTemplate.opsForValue().multiSet(values);

        for (String key : values.keySet()) {
            redisTemplate.expire(key, expirationTime, timeUnit);
        }
    }

    /**
     * Redis에서 조회수 증가
     */
    public void incrementValue(String key) {
        redisTemplate.opsForValue().increment(key, 1);
    }

    public <T> void setJsonValue(String key, T data) {
        try {
            String jsonData = objectMapper.writeValueAsString(data);
            ValueOperations<String, Object> values = redisTemplate.opsForValue();
            values.set(key, jsonData);
        } catch (JsonProcessingException e) {
            throw new CustomException(RedisErrorCode.REDIS_SAVE_FAILED);
        }
    }

    public <T> T getJsonValue(String key, Class<T> clazz) {
        String jsonData = getValue(key);
        if (jsonData == null) return null;
        try {
            return objectMapper.readValue(jsonData, clazz);
        } catch (JsonProcessingException e) {
            throw new CustomException(RedisErrorCode.REDIS_FETCH_FAILED);
        }
    }

    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }

    public void deleteBinaryValue(String key) {
        redisBinaryTemplate.delete(key);
    }

    public void setBinaryValue(String key, byte[] data) {
        if (data == null || data.length == 0) {
            throw new CustomException(RedisErrorCode.REDIS_SAVE_FAILED);
        }
        redisBinaryTemplate.opsForValue().set(key, data); // `byte[]` 그대로 저장
    }

    public byte[] getBinaryValue(String key) {
        byte[] data = redisBinaryTemplate.opsForValue().get(key);
        if (data == null) {
            log.warn("Redis에서 키 {}의 바이너리 데이터를 찾을 수 없음", key);
            return null;
        }
        return data;
    }
}
