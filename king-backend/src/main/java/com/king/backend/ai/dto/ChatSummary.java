package com.king.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // JSON에 예상하지 못한 필드가 있어도 무시
public class ChatSummary {
    private String summary;

    @JsonProperty("isRecommend")
    private boolean isRecommend;
    private String type;
    private String keyword;
}
