package com.king.backend.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FcmConfig {
    @Value("${fcm.service-account-file}")
    private String serviceAccountFile;

    @PostConstruct
    private void init() throws IOException {
        InputStream serviceAccount =
                new ClassPathResource(serviceAccountFile).getInputStream();

        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            log.info("파이어베이스 초기화");
            FirebaseApp.initializeApp(options);
        }
    }
}
