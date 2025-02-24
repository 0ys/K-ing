package com.king.backend.global.translate;

import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TranslateService {

    private final TranslateUtil translateUtil;
    private final RedisUtil redisUtil;

    public Map<String, String> getTranslatedText(Map<String, String> originalText, String targetLanguage) {
        if (targetLanguage == null) {
            return originalText;
        }

        if (!targetLanguage.matches("^(ko|en|ja|zh)$")) {
            throw new CustomException(UserErrorCode.INVALID_LANGUAGE);
        }

        List<String> redisKeys = originalText.keySet().stream().toList();
        List<String> cachedText = redisUtil.getValues(redisKeys);

        Map<String, String> textToTranslate = new HashMap<>();
        Map<String, String> translatedText = new HashMap<>();

        for (int i = 0; i < redisKeys.size(); i++) {
            String cached = cachedText.get(i);
            String key = redisKeys.get(i);

            if (cached == null) {
                textToTranslate.put(key, originalText.get(key));
                continue;
            }

            translatedText.put(key, cached);
        }

        List<String> translatedValues = translateUtil.translateText(textToTranslate.values().stream().toList(), targetLanguage);
        List<String> keySet = textToTranslate.keySet().stream().toList();

        for (int i = 0; i < translatedValues.size(); i++) {
            String key = keySet.get(i);
            String value = translatedValues.get(i);
            translatedText.put(key, value);
            redisUtil.setValues(translatedText, 7, TimeUnit.DAYS);
        }

        return translatedText;
    }
}
