package com.king.backend.domain.place.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class GooglePhotoService {
    private final RestTemplate restTemplate;

    @Value("${spring.place.google-api-key}")
    private String API_KEY;

    @Value("%{server.url}")
    private String SERVER_BASE_URL;

    public GooglePhotoService() {
        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(RequestConfig.custom()
                        .setRedirectsEnabled(false)  // 리디렉션 방지
                        .build())
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);

        this.restTemplate = new RestTemplate(factory);
    }

    public String getRedirectedImageUrl(String requestUrl) {
        if (requestUrl == null || !requestUrl.startsWith("https://map")) {
            return requestUrl;
        }

        String updatedUrl = requestUrl.replaceAll("key=[^&]+", "key=" + API_KEY);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Referer", SERVER_BASE_URL);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(updatedUrl, HttpMethod.GET, entity, Void.class);
        log.info("response: {}", response);

        if (response.getStatusCode().is3xxRedirection()) {
            return response.getHeaders().getLocation().toString();
        }

        return requestUrl;
    }

}
