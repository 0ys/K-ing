package com.king.backend.domain.curation.dto.response;

import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CurationDetailResponseDTO {
    private Long curationListId;
    private String title;
    private String description;
    private String imageUrl;
    private OffsetDateTime createdAt;
    private boolean bookmarked;
    private boolean isPublic;
    private WriterDTO writer;
    private List<PlaceDTO> places;

    public static CurationDetailResponseDTO fromEntity(
            CurationList curationList,
            boolean bookmarked,
            List<Place> places
    ) {
        return new CurationDetailResponseDTO(
                curationList.getId(),
                curationList.getTitle(),
                curationList.getDescription(),
                curationList.getImageUrl(),
                curationList.getCreatedAt(),
                bookmarked,
                curationList.isPublic(),
                WriterDTO.fromEntity(curationList.getWriter()),
                places.stream()
                        .map(PlaceDTO::fromEntity)
                        .toList()
        );
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class WriterDTO {
        Long userId;
        String nickname;
        String imageUrl;

        public static WriterDTO fromEntity(User writer) {
            return new WriterDTO(
                    writer.getId(),
                    writer.getNickname(),
                    writer.getImageUrl()
                    );
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceDTO {
        Long placeId;
        String name;
        String type;
        String address;
        float lat;
        float lng;
        String imageUrl;

        public static PlaceDTO fromEntity(Place place) {
            return new PlaceDTO(
                    place.getId(),
                    place.getName(),
                    place.getType().toUpperCase(),
                    place.getAddress(),
                    place.getLat(),
                    place.getLng(),
                    place.getImageUrl()
                    );
        }
    }
}
