package com.king.backend.domain.post.service;

import com.google.firebase.messaging.FirebaseMessagingException;
import com.king.backend.domain.fcm.entity.FcmToken;
import com.king.backend.domain.fcm.repository.FcmTokenRepository;
import com.king.backend.domain.fcm.service.FcmTokenService;
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
import com.king.backend.global.translate.TranslateService;
import com.king.backend.search.util.CursorUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

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
    private final TranslateService translateService;
    private static final long MULTIPLIER = 1_000_000_000L;
    private final FcmTokenRepository fcmTokenRepository;
    private final FcmTokenService fcmTokenService;
    @Value("${client.url}")
    private String CLIENT_URL;

    @Transactional
    public void uploadComment(Long postId, CommentUploadRequestDto reqDto) {
        if (reqDto.getContent() == null || reqDto.getContent().trim().isEmpty()) {
            throw new CustomException(CommentErrorCode.INVALID_COMMENT);
        }

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
        Comment savedComment = commentRepository.save(comment);

        User postOwner = post.getWriter();
        User commentWriter = savedComment.getWriter();
        if (!postOwner.getId().equals(commentWriter.getId()) && postOwner.getContentAlarmOn()) {
            List<FcmToken> tokens = fcmTokenRepository.findByUser(postOwner);
            String language = postOwner.getLanguage();
            String title;
            String body;
            if ("ko".equalsIgnoreCase(language)) {
                title = "댓글 알림";
                body = "새로운 댓글이 달렸어요!";
            }
            else if ("ja".equalsIgnoreCase(language)) {
                title = "コメント通知";
                body = "新しいコメントがありました！";
            } else if ("zh".equalsIgnoreCase(language)) {
                title = "评论提醒";
                body = "有新的評論上來了！";
            } else {
                title = "Comment Alert";
                body = "There's a new comment!";
            }
            String link = CLIENT_URL +"/feed/" + postId;

            for (FcmToken tokenEntity : tokens) {
                try {
                    fcmTokenService.sendMessageByToken(tokenEntity.getToken(), title, body, link);
                } catch (FirebaseMessagingException e) {
                    log.error("푸시 알림 전송 실패 (토큰: {}): {}", tokenEntity.getToken(), e.getMessage());
                }
            }
        }
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
        String language = oauthUser.getLanguage();

        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));

        String cursor = reqDto.getCursor();
        int size = Optional.ofNullable(reqDto.getSize()).orElse(10);
        List<Object> sortValues = (cursor != null) ? cursorUtil.decodeCursor(cursor) : null;

        Double score = redisStringTemplate.opsForZSet().score(POST_LIKES_KEY, postId.toString());
        Long likesCount = (score != null) ? (long) (score / MULTIPLIER) : 0L;

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
            comments = commentRepository.findAllByPostAndIdGreaterThanOrderByIdAsc(post, id, PageRequest.of(0, size));
        }

        String nextCursor = (comments.size() == size)
                ? cursorUtil.encodeCursor(List.of(comments.get(comments.size() - 1).getId()))
                : null;

        boolean original = reqDto.isOriginal();

        Map<String, String> originalTexts = new HashMap<>();
        List<String> keys = new ArrayList<>();
        List<CommentAllResponseDto.Comment.CommentBuilder> commentsBuilders = comments.stream()
                .map(comment -> {
                    CommentAllResponseDto.Comment.CommentBuilder builder = CommentAllResponseDto.Comment.builder()
                            .commentId(comment.getId())
                            .createdAt(comment.getCreatedAt())
                            .writer(CommentAllResponseDto.Writer.builder()
                                    .userId(comment.getWriter().getId())
                                    .nickname(comment.getWriter().getNickname())
                                    .imageUrl(comment.getWriter().getImageUrl())
                                    .build());

                    if (original) {
                        builder.content(comment.getContent());
                        return builder;
                    }

                    String key = "comment:" + comment.getId() + ":" + language;
                    originalTexts.put(key, comment.getContent());
                    keys.add(key);

                    return builder;
                })
                .toList();

        CommentAllResponseDto.CommentAllResponseDtoBuilder builder = CommentAllResponseDto.builder()
                .isLiked(isLiked)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .nextCursor(nextCursor);

        if (original) {
            return builder.comments(commentsBuilders.stream()
                            .map(CommentAllResponseDto.Comment.CommentBuilder::build)
                            .toList())
                    .build();
        }

        Map<String, String> translatedTexts = translateService.getTranslatedText(originalTexts, language);
        List<CommentAllResponseDto.Comment> commentsDto = new ArrayList<>();
        for (int i = 0; i < commentsBuilders.size(); i++) {
            commentsDto.add(commentsBuilders.get(i)
                    .content(translatedTexts.get(keys.get(i)))
                    .build());
        }

        return builder
                .comments(commentsDto)
                .build();
    }
}
