package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListItem;
import com.king.backend.domain.place.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurationListItemRepository extends JpaRepository<CurationListItem, Long> {
    List<CurationListItem> findByCurationListId(Long curationListId);
    Optional<CurationListItem> findByCurationListAndPlace(CurationList curationList, Place place);
    void deleteAllByCurationList(CurationList curationList);
}
