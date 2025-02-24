package com.king.backend.domain.curation.repository;

import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.entity.CurationListBookmark;
import com.king.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface CurationListBookmarkRepository extends JpaRepository<CurationListBookmark, Long> {
    boolean existsByCurationListIdAndUserId(Long curationListId, Long userId);
    Optional<CurationListBookmark> findByCurationListAndUser(CurationList curationList, User user);

    @Query("SELECT b from CurationListBookmark b " +
            "WHERE (b.user.id = :userId) " +
            "AND (b.curationList.writer.id = :userId OR b.curationList.isPublic) " +
            "AND (:id IS NULL OR b.id < :id) " +
            "ORDER BY b.id DESC " +
            "LIMIT :size")
    List<CurationListBookmark> findByUserId(@Param("userId") Long userId,
                                            @Param("id") Long id,
                                            @Param("size") int size);

    void deleteAllByCurationList(CurationList curationList);

    List<CurationListBookmark> findByUserIdAndCurationListIdIn(Long userId, Set<Long> curationListIds);
}
