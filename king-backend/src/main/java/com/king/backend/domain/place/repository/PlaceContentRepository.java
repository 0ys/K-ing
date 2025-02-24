package com.king.backend.domain.place.repository;

import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.entity.PlaceContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaceContentRepository extends JpaRepository<PlaceContent, Long> {
    Optional<PlaceContent> findByPlaceAndContent(Place place, Content content);
}
