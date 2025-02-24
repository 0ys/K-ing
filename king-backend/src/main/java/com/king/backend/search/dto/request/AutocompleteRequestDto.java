package com.king.backend.search.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 자동완성 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteRequestDto {
    private String query;
    private String category;
}
