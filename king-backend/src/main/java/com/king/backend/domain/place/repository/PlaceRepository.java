package com.king.backend.domain.place.repository;

import com.king.backend.domain.place.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    Optional<Place> findByNameAndAddress(String name, String address);

    @Query("SELECT p FROM Place p WHERE REPLACE(p.name, ' ', '') = REPLACE(:name, ' ', '')")
    Optional<Place> findByName(@Param("name") String name);


    @Override
    List<Place> findAll();

    @Query("select distinct p from Place p " +
            "left join fetch p.placeCasts pc " +
            "left join fetch pc.cast c " +
            "left join fetch c.translationKo " +
            "left join fetch p.placeContents pco " +
            "left join fetch pco.content con " +
            "left join fetch con.translationKo")
    List<Place> findAllWithAssociations();
}
