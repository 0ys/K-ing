package com.king.backend.datasetting.config;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private PublicApi publicApi = new PublicApi();
    private Scheduler scheduler = new Scheduler();
    private GoogleApi googleApi = new GoogleApi();
    private TmdbApi tmdbApi = new TmdbApi();

    @Data
    public static class PublicApi{
        private String url;
        private String key;
    }

    @Data
    public static class Scheduler{
        private long publicDataInterval;
    }

    @Data
    public static class GoogleApi {
        private String autocompleteUrl;
        private String nearbyUrl;
        private String searchUrl;
        private String detailsUrl;
        private String photosUrl;
        private String key;
    }

    @Data
    public static class TmdbApi {
        // TMDB API 기본 URL, 예: "https://api.themoviedb.org/3"
        private String baseUrl;
        private String key;
    }
}

