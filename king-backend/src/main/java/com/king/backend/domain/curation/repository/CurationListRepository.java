package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurationListRepository extends JpaRepository<CurationList, Long> {
    @Query("SELECT c FROM CurationList c JOIN FETCH c.writer")
    List<CurationList> findAllWithWriter();

    @Query("SELECT c FROM CurationList c " +
            "LEFT JOIN CurationListBookmark b ON c.id = b.curationList.id " +
            "WHERE (:writerId IS NULL OR c.writer.id = :writerId) " +
            "AND (:isPublic IS NULL OR c.isPublic = :isPublic) " +
            "AND (:cursor IS NULL OR c.id < :cursor) " +
            "AND (:bookmarked IS NULL OR " +
            "(:bookmarked = true AND c.id IN (SELECT b2.curationList.id FROM CurationListBookmark b2 WHERE b2.user.id = :userId)) OR " +
            "(:bookmarked = false AND c.id NOT IN (SELECT b3.curationList.id FROM CurationListBookmark b3 WHERE b3.user.id = :userId))) " +
            "ORDER BY c.id DESC " +
            "LIMIT :size")
    List<CurationList> searchCurations(
            @Param("writerId") Long writerId,
            @Param("isPublic") Boolean isPublic,
            @Param("cursor") Long cursor,
            @Param("size") int size,
            @Param("bookmarked") Boolean bookmarked,
            @Param("userId") Long userId);
}
