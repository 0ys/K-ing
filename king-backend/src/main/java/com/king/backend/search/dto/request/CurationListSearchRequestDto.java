package com.king.backend.search.dto.request;

import lombok.Data;

@Data
public class CurationListSearchRequestDto {
    /**
     * 검색어 (입력되지 않으면 전체 조회)
     */
    private String query;

    /**
     * 커서 (무한 스크롤용)
     */
    private String cursor;
}
