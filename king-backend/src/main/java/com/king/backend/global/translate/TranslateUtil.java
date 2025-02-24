package com.king.backend.global.translate;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.king.backend.global.errorcode.TranslateErrorCode;
import com.king.backend.global.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class TranslateUtil {
    private final Translate translate;

    public TranslateUtil(@Value("${spring.translate.google-translate-key}") String googleTranslateKey) {
        try {
            InputStream serviceAccountStream = new ClassPathResource(googleTranslateKey).getInputStream();
            this.translate = TranslateOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                    .build()
                    .getService();
        } catch (IOException e) {
            throw new CustomException(TranslateErrorCode.GOOGLE_CREDENTIAL_FAILED);
        }
    }

    public String translateText(String text, String targetLanguage) {
        if (text.isEmpty()) {
            return "";
        }
        return translate.translate(text, Translate.TranslateOption.targetLanguage(targetLanguage)).getTranslatedText();
    }

    public List<String> translateText(List<String> texts, String targetLanguage) {
        if (texts.isEmpty()) {
            return new ArrayList<>();
        }
        return translate.translate(texts, Translate.TranslateOption.targetLanguage(targetLanguage))
                .stream()
                .map(Translation::getTranslatedText)
                .toList();
    }
}
