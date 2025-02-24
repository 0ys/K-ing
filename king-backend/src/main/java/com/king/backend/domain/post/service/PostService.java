package com.king.backend.domain.post.service;

import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.domain.post.dto.request.PostFeedRequestDto;
import com.king.backend.domain.post.dto.request.PostHomeRequestDto;
import com.king.backend.domain.post.dto.request.PostUploadRequestDto;
import com.king.backend.domain.post.dto.response.PostDetailResponseDto;
import com.king.backend.domain.post.dto.response.PostFeedResponseDto;
import com.king.backend.domain.post.dto.response.PostHomeResponseDto;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.post.entity.PostImage;
import com.king.backend.domain.post.errorcode.PostErrorCode;
import com.king.backend.domain.post.repository.CommentRepository;
import com.king.backend.domain.post.repository.LikeRepository;
import com.king.backend.domain.post.repository.PostImageRepository;
import com.king.backend.domain.post.repository.PostRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.domain.user.entity.User;
import com.king.backend.domain.user.errorcode.UserErrorCode;
import com.king.backend.domain.user.repository.UserRepository;
import com.king.backend.global.errorcode.ImageErrorCode;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.translate.TranslateService;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.s3.service.S3Service;
import com.king.backend.search.util.CursorUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final LikeRepository likeRepository;
    private final LikeService likeService;
    private final CommentRepository commentRepository;
    private final CursorUtil cursorUtil;
    private final TranslateService translateService;
    private final RedisTemplate<String, String> redisStringTemplate;
    private final RedisUtil redisUtil;
    private static final String POST_LIKES_KEY = "post:likes";
    private static final long MULTIPLIER = 1_000_000_000L;

    private double computeCompositeScore(long likeCount, long postId) {
        return likeCount * MULTIPLIER + postId;
    }

    @Transactional
    public Long uploadPost(PostUploadRequestDto reqDto, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(user.getName());
        User writer = userRepository.findById(userId).orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Place place = placeRepository.findById(reqDto.getPlaceId())
                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

        Post post = Post.builder()
                .content(reqDto.getContent())
                .isPublic(reqDto.isPublic())
                .writer(writer)
                .place(place)
                .build();
        postRepository.save(post);

        redisStringTemplate.opsForZSet().add(
                POST_LIKES_KEY,
                post.getId().toString(),
                computeCompositeScore(0, post.getId())
        );

        if (imageFile != null && !imageFile.isEmpty()) {
            long maxFileSize = 5 * 1024 * 1024;
            if(imageFile.getSize() > maxFileSize) {
                throw new CustomException(ImageErrorCode.MAX_UPLOAD_SIZE_EXCEEDED);
            }
            String s3Url = s3Service.uploadFile(post, imageFile);
            PostImage postImage = PostImage.builder()
                    .imageUrl(s3Url)
                    .post(post)
                    .build();
            postImageRepository.save(postImage);
        }
        return post.getId();
    }

    public PostHomeResponseDto getHomePostsWithCursor(PostHomeRequestDto reqDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(user.getName());
        String language = user.getLanguage();

        String cursor = reqDto.getCursor();
        int size = Optional.ofNullable(reqDto.getSize()).orElse(10);
        List<Object> sortValues = (cursor != null) ? cursorUtil.decodeCursor(cursor) : null;

        List<Post> posts = getHomePosts(sortValues, size);

        String nextCursor = (posts.size() == size)
                ? cursorUtil.encodeCursor(List.of(posts.get(posts.size() - 1).getId()))
                : null;

        Map<String, String> originalText = new HashMap<>();
        List<String> keys = new ArrayList<>();

        List<PostHomeResponseDto.Post.PostBuilder> postBuilders = posts.stream().map(post -> {
            String imageUrl = postImageRepository.findByPostId(post.getId())
                    .map(PostImage::getImageUrl)
                    .orElse(null);

            Double compositeScore = redisStringTemplate.opsForZSet().score(POST_LIKES_KEY, post.getId().toString());
            Long likesCount = (compositeScore != null) ? (long)(compositeScore / MULTIPLIER) : 0L;

            Boolean isLiked = false;
            if (userId != null) {
                isLiked = Boolean.TRUE.equals(redisStringTemplate.opsForSet().isMember("post:likes:" + post.getId(), userId.toString()));
            }

            Long commentsCount = commentRepository.countByPostId(post.getId());

            String key = "post:" + post.getId() + ":" + language;
            originalText.put(key, post.getContent());
            keys.add(key);

            return PostHomeResponseDto.Post.builder()
                    .postId(post.getId())
                    .imageUrl(imageUrl)
                    .likesCnt(likesCount)
                    .isLiked(isLiked)
                    .commentsCnt(commentsCount)
                    .writer(new PostHomeResponseDto.Writer(post.getWriter().getId(), post.getWriter().getNickname()))
                    .createdAt(post.getCreatedAt())
                    .updatedAt(post.getUpdatedAt());
        }).toList();

        Map<String, String> translatedText = translateService.getTranslatedText(originalText, language);

        List<PostHomeResponseDto.Post> postDtos = new ArrayList<>();
        for (int i = 0; i < postBuilders.size(); i++) {
            postDtos.add(postBuilders.get(i)
                    .content(translatedText.get(keys.get(i)))
                    .build());
        }
        return new PostHomeResponseDto(postDtos, nextCursor);
    }

    public List<Post> getHomePosts(List<Object> sortValues, int size) {
        if(sortValues == null || sortValues.isEmpty()) {
            return postRepository.findAllByIsPublicOrderByIdDesc(true, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return postRepository.findByIsPublicAndIdLessThanOrderByIdDesc(true, id, PageRequest.of(0, size));
        }
    }

    public PostFeedResponseDto getFeedPostsWithCursor(PostFeedRequestDto reqDto) {
        String cursor = reqDto.getCursor();
        int size = Optional.ofNullable(reqDto.getSize()).orElse(10);
        List<Object> sortValues = (cursor != null) ? cursorUtil.decodeCursor(cursor) : null;

        List<Post> posts;
        if ("review".equals(reqDto.getFeedType())) {
            Long placeId = reqDto.getPlaceId();
            if (placeId == null) {
                throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
            }
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));
            if("popular".equals(reqDto.getSortedBy())) {
                posts = getPopularReviewPosts(place, sortValues, size);
            } else {
                posts = getLatestReviewPosts(place, sortValues, size);
            }
        } else if ("myPage".equals(reqDto.getFeedType())) {
            Long userId = reqDto.getUserId();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
            Long authId = Long.parseLong(authUser.getName());

            if (userId == null) {
                throw new CustomException(UserErrorCode.USER_NOT_FOUND);
            } else {
                User user = userRepository.findByIdAndStatus(userId, "ROLE_REGISTERED")
                        .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
                posts = (userId.equals(authId))
                        ? getMyPagePosts(user, sortValues, size)
                        : getPublicMyPagePosts(user, sortValues, size);
            }
        } else {
            throw new IllegalArgumentException("Invalid feedType: " + reqDto.getFeedType());
        }

        String nextCursor = null;
        if(posts.size() == size) {
            if ("popular".equals(reqDto.getSortedBy())) {
                Post lastPost = posts.get(posts.size() - 1);
                Double lastCompositeScore = redisStringTemplate.opsForZSet().score(POST_LIKES_KEY, lastPost.getId().toString());
                log.info("lastPost: {}, lastCompositeScore: {}", lastPost.getId(), lastCompositeScore);
                nextCursor = cursorUtil.encodeCursor(List.of(lastCompositeScore));
            } else {
                nextCursor = cursorUtil.encodeCursor(List.of(posts.get(posts.size() - 1).getId()));
            }
        }

        List<PostFeedResponseDto.Post> postDtos = posts.stream().map(post -> {
                    String imageUrl = postImageRepository.findByPostId(post.getId())
                            .map(PostImage::getImageUrl)
                            .orElse(null);

                    return PostFeedResponseDto.Post.builder()
                        .postId(post.getId())
                        .imageUrl(imageUrl)
                        .isPublic(post.isPublic())
                        .build();
                }
        ).toList();

        return new PostFeedResponseDto(postDtos, nextCursor);
    }

    public List<Post> getPopularReviewPosts(Place place, List<Object> sortValues, int size) {
        double upperBound;
        if (sortValues == null || sortValues.isEmpty()) {
            upperBound = Double.POSITIVE_INFINITY;
        } else {
            double lastCompositeScore = Double.parseDouble(sortValues.get(0).toString());
            upperBound = lastCompositeScore - 1;
        }

        Set<String> candidateSet = redisStringTemplate.opsForZSet()
                .rangeByScore(POST_LIKES_KEY, 0, upperBound);

        if (candidateSet == null || candidateSet.isEmpty()) {
            return postRepository.findByIsPublicAndPlaceOrderByIdDesc(true, place, PageRequest.of(0, size));
        }

        List<Long> sortedIdList = new ArrayList<>(candidateSet.stream()
                .map(Long::valueOf)
                .toList());
        Collections.reverse(sortedIdList);

        List<Post> posts = postRepository.findAllById(sortedIdList)
                .stream()
                .filter(p -> p.getPlace().getId().equals(place.getId()) && p.isPublic())
                .collect(Collectors.toList());

        // Redis에서 정렬된 순서 유지
        posts.sort(Comparator.comparingInt(p -> sortedIdList.indexOf(p.getId())));
        System.out.println("posts: " + posts);

        if (posts.size() > size) {
            posts = posts.subList(0, size);
        }
        return posts;
    }

    public List<Post> getLatestReviewPosts(Place place, List<Object> sortValues, int size) {
        if (sortValues == null) {
            return postRepository.findByIsPublicAndPlaceOrderByIdDesc(true, place, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return postRepository.findByIsPublicAndPlaceAndIdLessThanOrderByIdDesc(true, place, id, PageRequest.of(0, size));
        }
    }

    public List<Post> getMyPagePosts(User user, List<Object> sortValues, int size) {
        if (sortValues == null) {
            return postRepository.findAllByWriterOrderByIdDesc(user, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return postRepository.findByWriterAndIdLessThanOrderByIdDesc(user, id, PageRequest.of(0, size));
        }
    }

    public List<Post> getPublicMyPagePosts(User user, List<Object> sortValues, int size) {
        if(sortValues == null) {
            return postRepository.findAllByIsPublicAndWriterOrderByIdDesc(true, user, PageRequest.of(0, size));
        } else {
            Long id = Long.parseLong(sortValues.get(0).toString());
            return postRepository.findByIsPublicAndWriterAndIdLessThanOrderByIdDesc(true, user, id, PageRequest.of(0, size));
        }
    }

    @Transactional
    public PostDetailResponseDto getPostDetail(Long postId, boolean original) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));
        User writer = post.getWriter();
        String imageUrl = postImageRepository.findByPostId(postId).map(PostImage::getImageUrl).orElse(null);

        PostDetailResponseDto.PostDetailResponseDtoBuilder builder = PostDetailResponseDto.builder()
                .postId(post.getId())
                .createdAt(post.getCreatedAt())
                .imageUrl(imageUrl)
                .isPublic(post.isPublic())
                .writer(PostDetailResponseDto.Writer.builder()
                        .userId(writer.getId())
                        .nickname(writer.getNickname())
                        .imageUrl(writer.getImageUrl())
                        .build())
                .place(PostDetailResponseDto.Place.builder()
                        .placeId(post.getPlace().getId())
                        .name(post.getPlace().getName())
                        .build());

        if (original) {
            return builder
                    .content(post.getContent())
                    .build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
        String language = authUser.getLanguage();

        String key = "post:" + post.getId() + ":" + language;
        Map<String, String> originalText = new HashMap<>();
        originalText.put(key, post.getContent());
        Map<String, String> translatedText = translateService.getTranslatedText(originalText, language);

        return builder
                .content(translatedText.get(key))
                .build();
    }

    @Transactional
    public Long updatePost(Long postId, PostUploadRequestDto reqDto, MultipartFile imageFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(user.getName());
        String language = user.getLanguage();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));
        if (!post.getWriter().getId().equals(userId)) {
            throw new CustomException(PostErrorCode.POST_UPDATE_ACCESS_DENIED);
        }

        Place newPlace = null;
        if (reqDto.getPlaceId() != null) {
            newPlace = placeRepository.findById(reqDto.getPlaceId())
                    .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));
        }
        post.update(reqDto.getContent(), newPlace, reqDto.isPublic());

        if (imageFile != null && !imageFile.isEmpty()) {
            long maxFileSize = 5 * 1024 * 1024;
            if (imageFile.getSize() > maxFileSize) {
                throw new CustomException(ImageErrorCode.MAX_UPLOAD_SIZE_EXCEEDED);
            }
            // 기존 이미지 삭제
            PostImage postImage = postImageRepository.findByPostId(postId)
                    .orElseThrow(() -> new RuntimeException("해당 Post ID에 대한 이미지가 존재하지 않습니다. Post ID: " + postId));

            String imageUrl = postImage.getImageUrl();
            log.info("postService : 삭제할 imageUrl {}", imageUrl);

//            s3Service.deleteFile(imageUrl);
            postImageRepository.delete(postImage);
            log.info("postService : 삭제했는가 imageUrl {}", postImage.getImageUrl());

            // 새 이미지 업로드
            String newImageUrl = s3Service.uploadFile(post, imageFile);
            PostImage newPostImage = PostImage.builder()
                    .imageUrl(newImageUrl)
                    .post(post)
                    .build();
            postImageRepository.save(newPostImage);
        }

        String key = "post:" + post.getId() + ":" + language;
        redisUtil.deleteValue(key);

        return post.getId();
    }

    @Transactional
    public void deletePost(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        OAuth2UserDTO user = (OAuth2UserDTO) authentication.getPrincipal();
        Long userId = Long.parseLong(user.getName());
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(PostErrorCode.POST_NOT_FOUND));
        
        if (!post.getWriter().getId().equals(userId)) {
            throw new CustomException(PostErrorCode.POST_DELETE_ACCESS_DENIED);
        }

        postImageRepository.findByPostId(postId).ifPresent(postImage -> {
            String imageUrl = postImage.getImageUrl();
            s3Service.deleteFile(imageUrl);
            postImageRepository.delete(postImage);
        });
        
        likeRepository.deleteByPostId(postId);
        redisStringTemplate.delete("post:likes:" + postId);
        redisStringTemplate.opsForZSet().remove(POST_LIKES_KEY, postId.toString());
        
        commentRepository.deleteByPostId(postId);
        
        postRepository.delete(post);
    }
}
