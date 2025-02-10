package com.king.backend.ai.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.king.backend.ai.dto.CurationSearchResponseDto;
import com.king.backend.ai.dto.PlaceSearchResponseDto;

import java.util.List;
import java.util.stream.Collectors;

public class SearchResultFormatter {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 장소 검색 결과를 AI 프롬프트 JSON으로 변환
     */
    public static String formatPlaceSearchResultsForAI(PlaceSearchResponseDto searchResults) {
        if (searchResults == null || searchResults.getPlaces().isEmpty()) {
            return "[]";
        }

        try {
            List<SimplifiedPlace> simplifiedPlaces = searchResults.getPlaces().stream()
                    .map(place -> new SimplifiedPlace(place.getName(), place.getType(), place.getAddress(), place.getDescription()))
                    .collect(Collectors.toList());

            return objectMapper.writeValueAsString(simplifiedPlaces);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

    /**
     * 큐레이션 검색 결과를 AI 프롬프트 JSON으로 변환
     */
    public static String formatCurationSearchResultsForAI(CurationSearchResponseDto searchResults) {
        if (searchResults == null || searchResults.getCurations().isEmpty()) {
            return "[]";
        }

        try {
            List<SimplifiedCuration> simplifiedCurations = searchResults.getCurations().stream()
                    .map(curation -> new SimplifiedCuration(curation.getTitle(), curation.getDescription()))
                    .collect(Collectors.toList());

            return objectMapper.writeValueAsString(simplifiedCurations);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }

    private static class SimplifiedPlace {
        public String name;
        public String type;
        public String address;
        public String description;

        public SimplifiedPlace(String name, String type, String address, String description) {
            this.name = name;
            this.type = type;
            this.address = address;
            this.description = description;
        }
    }

    private static class SimplifiedCuration {
        public String title;
        public String description;

        public SimplifiedCuration(String title, String description) {
            this.title = title;
            this.description = description;
        }
    }
}

