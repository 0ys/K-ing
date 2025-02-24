package com.king.backend.domain.place.service;

import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.place.dto.response.PlaceDetailResponseDto;
import com.king.backend.domain.place.dto.response.PlaceIdResponseDto;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.entity.PlaceContent;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaceService {
    private final PlaceRepository placeRepository;
    private final GooglePhotoService googlePhotoService;

    @Transactional
    public PlaceDetailResponseDto getPlaceDetail(Long id){
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));
        List<PlaceDetailResponseDto.RelatedContent> relatedContents = place.getPlaceContents().stream()
                .map(this::mapToRelatedContents)
                .collect(Collectors.toList());

        String imageUrl = place.getImageUrl() == null ? "https://d1qaf0hhk6y1ff.cloudfront.net/uploads/default.jpg" : googlePhotoService.getRedirectedImageUrl(place.getImageUrl());

        place.setImageUrl(imageUrl);
        placeRepository.save(place);

        return new PlaceDetailResponseDto(
                place.getId(),
                place.getName(),
                place.getType(),
                place.getAddress(),
                place.getPhone(),
                place.getOpenHour(),
                place.getBreakTime(),
                place.getClosedDay(),
                (double) place.getLat(),
                (double) place.getLng(),
                place.getCreatedAt(),
                place.getImageUrl(),
                relatedContents

        );

    }

    private PlaceDetailResponseDto.RelatedContent mapToRelatedContents(PlaceContent placeContent) {
        Content content = placeContent.getContent();
        return new PlaceDetailResponseDto.RelatedContent(
                content.getId(),
                content.getTranslationKo().getTitle(),
                content.getType(),
                placeContent.getDescription()
        );
    }

    public PlaceIdResponseDto getPlaceIdByName(String name) {
        Optional<Place> place = placeRepository.findByName(name);

        if (place.isEmpty()) {
            throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
        }

        return new PlaceIdResponseDto(place.get().getId());
    }

}
