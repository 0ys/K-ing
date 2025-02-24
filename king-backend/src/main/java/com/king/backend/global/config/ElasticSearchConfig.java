package com.king.backend.global.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticSearchConfig {

    // 예: "localhost:9200"
    @Value("${spring.elasticsearch.uris}")
    private String host;

    @Value("${spring.elasticsearch.username}")
    private String username;

    @Value("${spring.elasticsearch.password}")
    private String password;

    private final ObjectMapper objectMapper;

    public ElasticSearchConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public ElasticsearchClient elasticsearchClient() {
        // JavaTimeModule 등록 및 날짜 직렬화를 ISO-8601 문자열로 설정
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // ObjectMapper를 사용하는 JacksonJsonpMapper 생성
        JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper(objectMapper);

        // host 값을 "hostname:port" 형태로 분리
        String[] parts = host.split(":");
        String hostname = parts[0];
        int port = Integer.parseInt(parts[1]);

        // BasicCredentialsProvider를 사용하여 인증 정보 설정
        BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(username, password)
        );

        // RestClient 빌더 생성 (HTTP 프로토콜 사용) 및 기본 인증 설정 추가
        RestClientBuilder builder = RestClient.builder(new HttpHost(hostname, port, "http"))
                .setHttpClientConfigCallback(httpClientBuilder ->
                        httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider)
                );
        RestClient restClient = builder.build();

        // RestClient와 jsonpMapper를 사용하여 ElasticsearchTransport 생성
        ElasticsearchTransport transport = new RestClientTransport(restClient, jsonpMapper);

        // ElasticsearchTransport를 이용해 ElasticsearchClient 생성 후 반환
        return new ElasticsearchClient(transport);
    }
}
