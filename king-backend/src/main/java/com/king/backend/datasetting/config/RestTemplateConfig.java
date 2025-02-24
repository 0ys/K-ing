package com.king.backend.datasetting.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        // 인코딩 모드를 NONE으로 설정하면 자동 인코딩을 수행하지 않습니다.
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setUriTemplateHandler(factory);
        return restTemplate;
    }
}

