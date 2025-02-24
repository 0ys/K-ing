package com.king.backend.domain.place.repository;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.entity.PlaceCast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaceCastRepository extends JpaRepository<PlaceCast, Long> {
    Optional<PlaceCast> findByPlaceAndCast(Place place, Cast cast);
}
