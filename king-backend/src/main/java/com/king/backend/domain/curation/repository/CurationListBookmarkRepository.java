package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationListBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface CurationListBookmarkRepository extends JpaRepository<CurationListBookmark, Long> {
    boolean existsByCurationListIdAndUserId(Long curationListId, Long userId);

    @Query("SELECT b.curationList.id FROM CurationListBookmark b WHERE b.user.id = :userId")
    Set<Long> findCurationListIdByUserId(Long userId);
}
