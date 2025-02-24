package com.king.backend.domain.post.repository;

import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // 홈피드
    List<Post> findAllByIsPublicOrderByIdDesc(boolean isPublic, Pageable pageable);
    List<Post> findByIsPublicAndIdLessThanOrderByIdDesc(boolean isPublic, Long lastId, Pageable pageable);
    // 장소리뷰 - 최신순
    List<Post> findByIsPublicAndPlaceOrderByIdDesc(boolean isPublic, Place place, Pageable pageable);
    List<Post> findByIsPublicAndPlaceAndIdLessThanOrderByIdDesc(boolean isPublic, Place place, Long lastId, Pageable pageable);
    // 마이페이지
    List<Post> findAllByWriterOrderByIdDesc(User user, Pageable pageable);
    List<Post> findByWriterAndIdLessThanOrderByIdDesc(User user, Long lastId, Pageable pageable);
    // 타사용자 마이페이지
    List<Post> findAllByIsPublicAndWriterOrderByIdDesc(boolean isPublic, User user, Pageable pageable);
    List<Post> findByIsPublicAndWriterAndIdLessThanOrderByIdDesc(boolean isPublic, User user, Long lastId, Pageable pageable);
}