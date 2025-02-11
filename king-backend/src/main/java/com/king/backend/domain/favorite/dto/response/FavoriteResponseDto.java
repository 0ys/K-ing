package com.king.backend.domain.favorite.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FavoriteResponseDto {
    List<Favorite> favorites;
    Long favoriteCount;

    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    @Builder
    public static class Favorite {
        private Long favoriteId;
        private String type;
        private String title;
        private String imageUrl;
        private OffsetDateTime createdAt;
    }
}
