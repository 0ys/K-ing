package com.king.backend.search.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@AllArgsConstructor
@Getter
@Setter
public class CurationListSearchResponseDto {

    /**
     * 검색 결과 리스트
     */
    private List<CurationListItemDto> items;

    /**
     * 다음 페이지 커서 (없으면 null)
     */
    private String nextCursor;

    @Data
    @AllArgsConstructor
    @Getter
    @Setter
    public static class CurationListItemDto {
        private Long id;
        private String title;
        private String imageUrl;
        private String writerNickname;
        private boolean isBookmarked;
    }
}
