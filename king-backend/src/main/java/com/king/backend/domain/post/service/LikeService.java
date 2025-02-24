package com.king.backend.domain.post.service;

import com.king.backend.domain.post.errorcode.LikeErrorCode;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LikeService {
    private final PostRepository postRepository;
    private final RedisTemplate<String, String> redisStringTemplate;
    private static final String POST_LIKES_KEY = "post:likes";
    private static final long MULTIPLIER = 1_000_000_000L;

    private double computeCompositeScore(long likeCount, long postId) {
        return likeCount * MULTIPLIER + postId;
    }

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
        String member = postId.toString();
        Double currentCompositeScore = redisStringTemplate.opsForZSet().score(POST_LIKES_KEY, member);
        long currentLikeCount = (currentCompositeScore == null) ? 0 : (long)(currentCompositeScore / MULTIPLIER);
        long newLikeCount = currentLikeCount + 1;
        double newCompositeScore = computeCompositeScore(newLikeCount, postId);
        redisStringTemplate.opsForZSet().add(POST_LIKES_KEY, member, newCompositeScore);
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
        String member = postId.toString();
        Double currentCompositeScore = redisStringTemplate.opsForZSet().score(POST_LIKES_KEY, member);
        long currentLikeCount = (currentCompositeScore == null) ? 0 : (long)(currentCompositeScore / MULTIPLIER);
        long newLikeCount = currentLikeCount - 1;
        double newCompositeScore = computeCompositeScore(newLikeCount, postId);
        redisStringTemplate.opsForZSet().add(POST_LIKES_KEY, member, newCompositeScore);
    }
}
