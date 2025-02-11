package com.king.backend.domain.post.service;

import com.king.backend.domain.post.dto.request.CommentRequestDto;
import com.king.backend.domain.post.dto.request.CommentUploadRequestDto;
import com.king.backend.domain.post.dto.response.CommentAllResponseDto;
import com.king.backend.domain.post.entity.Comment;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.post.errorcode.CommentErrorCode;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.CommentRepository;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.exception.CustomException;
import com.king.backend.search.util.CursorUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final RedisTemplate<String, String> redisStringTemplate;
    private static final String POST_LIKES_KEY = "post:likes";
    private final CursorUtil cursorUtil;

    @Transactional
    public void uploadComment(Long postId, CommentUploadRequestDto reqDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());
        User writer = userRepository.findById(userId).orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        Comment comment = Comment.builder()
                .content(reqDto.getContent())
                .post(post)
                .writer(writer)
                .build();

        commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(CommentErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getWriter().getId().equals(userId)) {
            throw new CustomException(CommentErrorCode.COMMENT_DELETE_ACCESS_DENIED);
        }

        commentRepository.deleteById(commentId);
    }

    public CommentAllResponseDto getComments(Long postId, CommentRequestDto reqDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO oauthUser = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(oauthUser.getName());

        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        String cursor = reqDto.getCursor();
        int size = Optional.ofNullable(reqDto.getSize()).orElse(10);
        List<Object> sortValues = (cursor != null) ? cursorUtil.decodeCursor(cursor) : null;

        Double score = redisStringTemplate.opsForZSet().score(POST_LIKES_KEY, postId.toString());
        Long likesCount = (score != null ? score.longValue() : 0L);

        Boolean isLiked = false;
        if (userId != null) {
            isLiked = Boolean.TRUE.equals(redisStringTemplate.opsForSet().isMember("post:likes:" + postId, userId.toString()));
        }

        Long commentsCount = commentRepository.countByPostId(postId);

        List<Comment> comments;
        if (sortValues == null) {
            comments = commentRepository.findAllByPostOrderByIdAsc(post, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            comments = commentRepository.findAllByPostAndIdLessThanOrderByIdAsc(post, id, PageRequest.of(0, size));
        }
        String nextCursor = (comments.size() == size)
                ? cursorUtil.encodeCursor(List.of(comments.get(comments.size() - 1).getId()))
                : null;

        List<CommentAllResponseDto.Comment> commentsDto = comments.stream()
                .map(comment -> CommentAllResponseDto.Comment.builder()
                        .commentId(comment.getId())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .writer(CommentAllResponseDto.Writer.builder()
                                .userId(comment.getWriter().getId())
                                .nickname(comment.getWriter().getNickname())
                                .imageUrl(comment.getWriter().getImageUrl())
                                .build())
                        .build())
                .toList();

        return CommentAllResponseDto.builder()
                .isLiked(isLiked)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .comments(commentsDto)
                .nextCursor(nextCursor)
                .build();
    }
}