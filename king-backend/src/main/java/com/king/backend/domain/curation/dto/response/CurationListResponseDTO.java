package com.king.backend.domain.curation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CurationListResponseDTO {
    private List<CurationDTO> curations;
    private String nextCursor;

    @Getter
    @Setter
    @Builder
    public static class CurationDTO {
        private Long curationId;
        private String title;
        private String imageUrl;
        private String writerNickname;
        private boolean isPublic;
        private boolean bookmarked;
    }
}
