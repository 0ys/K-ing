package com.king.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ES 검색 요청 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RagSearchRequestDto {
    private String type; // "drama", "cast" 등
    private String keywords; // "갯마을차차차"
}
