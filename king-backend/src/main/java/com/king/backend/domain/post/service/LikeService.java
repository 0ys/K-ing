package com.king.backend.domain.post.service;

import com.king.backend.domain.post.entity.Like;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.post.errorcode.LikeErrorCode;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.LikeRepository;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RedisTemplate<String, String> redisStringTemplate;
    private static final String POST_LIKES_KEY = "post:likes";

    @Transactional
    public void likePost(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        String redisSetKey = "post:likes:" + postId;
        Boolean alreadyLiked = redisStringTemplate.opsForSet().isMember(redisSetKey, userId.toString());
        if (Boolean.TRUE.equals(alreadyLiked)) {
            throw new CustomException(LikeErrorCode.ALREADY_LIKED);
        }

        redisStringTemplate.opsForSet().add(redisSetKey, userId.toString());
        redisStringTemplate.opsForZSet().incrementScore(POST_LIKES_KEY, postId.toString(), 1);
    }

    @Transactional
    public void unlikePost(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        String redisSetKey = "post:likes:" + postId;
        Boolean alreadyLiked = redisStringTemplate.opsForSet().isMember(redisSetKey, userId.toString());
        if (Boolean.FALSE.equals(alreadyLiked)) {
            throw new CustomException(LikeErrorCode.ALREADY_UNLIKED);
        }

        redisStringTemplate.opsForSet().remove(redisSetKey, userId.toString());
        redisStringTemplate.opsForZSet().incrementScore(POST_LIKES_KEY, postId.toString(), -1);
    }

    // 1시간마다 Redis 데이터를 DB로 저장
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void syncLikesToDB() {
        // Redis Sorted Set에서 모든 게시글 ID 조회
        Set<String> postIds = redisStringTemplate.opsForZSet().range(POST_LIKES_KEY, 0, -1);
        if (postIds == null || postIds.isEmpty()) {
            return;
        }

        for (String postIdStr : postIds) {
            Long postId = Long.parseLong(postIdStr);
            Set<String> redisUserIds = redisStringTemplate.opsForSet().members("post:likes:" + postId);
            if (redisUserIds == null) {
                redisUserIds = Set.of();
            }

            List<Like> dbLikes = likeRepository.findByPostId(postId);
            Set<String> dbUserIds = dbLikes.stream()
                    .map(like -> like.getUser().getId().toString())
                    .collect(Collectors.toSet());

            // Redis에는 있으나 DB에 없는 경우 -> (DB에 삽입)
            for (String userIdStr : redisUserIds) {
                if (!dbUserIds.contains(userIdStr)) {
                    User user = userRepository.findById(Long.parseLong(userIdStr))
                            .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
                    Post post = postRepository.findById(postId)
                            .orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));
                    Like newLike = Like.builder()
                            .post(post)
                            .user(user)
                            .build();
                    likeRepository.save(newLike);
                }
            }

            // DB에는 있으나 Redis에는 없는 경우 -> 삭제 처리 (좋아요 취소)
            for (Like like : dbLikes) {
                if (!redisUserIds.contains(like.getUser().getId().toString())) {
                    likeRepository.delete(like);
                }
            }
        }
    }
}
