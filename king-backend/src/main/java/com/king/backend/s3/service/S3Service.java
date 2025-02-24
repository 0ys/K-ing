package com.king.backend.s3.service;

import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.post.entity.Post;
import com.king.backend.domain.user.entity.User;
import com.king.backend.global.exception.CustomException;
import com.king.backend.s3.errorcode.S3ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    private final S3Client s3Client;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ContentRepository contentRepository;
    private final CastRepository castRepository;

    @Value("${spring.aws.s3-bucket}")
    private String bucketName;

    // 1. 사용자가 직접 업로드
    public String uploadFile(Object entity, MultipartFile file) {
        return uploadToS3(entity, file);
    }

    public List<String> uploadFiles(Object entity, List<MultipartFile> files) {
        return files.stream()
                .map(file -> uploadToS3(entity, file))
                .collect(Collectors.toList());
    }

    // 사용자가 업로드한 파일을 S3에 업로드
    private String uploadToS3(Object entity, MultipartFile file) {
        String filePath = getUploadPath(entity, file.getOriginalFilename());
        log.info("S3 업로드 경로 filePath : {}", filePath);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filePath)
                .contentType(file.getContentType())
                .build();
        try {
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new CustomException(S3ErrorCode.S3_UPLOAD_FAILED);
        }

        return getS3FileUrl(filePath);
    }

    // 2. tmdb 사진 업로드
    @Transactional
    public String getOrUploadImage(Object entity){
        String imageUrl;

        if(entity instanceof Content){
            imageUrl = ((Content) entity).getImageUrl();
        } else if (entity instanceof Cast){
            imageUrl = ((Cast) entity).getImageUrl();
        } else {
            throw new CustomException(S3ErrorCode.UNSUPPORTED_ENTITY_TYPE);
        }

        // 1) null이면 기본 이미지 url 반환
        if (imageUrl == null) {
            String defaultImageUrl = "https://d1qaf0hhk6y1ff.cloudfront.net/uploads/default.jpg";
            setEntityImage(entity, defaultImageUrl);
            log.info("imageUrl이 null이므로 default 이미지 반환");
            return defaultImageUrl;
        }

        // 2) DB에 TMDB url이 저장되어 있으면 S3에 업로드 후 DB에 S3 주소 업데이트
//        if(imageUrl.contains("image.tmdb.org")){
//            String s3ImageUrl = uploadTmdbImage(entity, imageUrl);
//            setEntityImage(entity, s3ImageUrl);
//            return s3ImageUrl;
//        }

        // 3) 이미 DB에 S3 주소가 저장되어 있으면 그대로 반환
        return imageUrl;
    }

    public String uploadTmdbImage(Object entity, String tmdbUrl) { //ToS3
        try {
            // TMDB 이미지 다운로드
            byte[] imageBytes = restTemplate.getForObject(tmdbUrl, byte[].class);
            if (imageBytes == null || imageBytes.length == 0) {
                throw new CustomException(S3ErrorCode.TMDB_IMAGE_DOWNLOAD_FAILED);
            }

            String filePath = getUploadPath(entity, extractFileName(tmdbUrl));
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filePath)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(imageBytes));

            return getS3FileUrl(filePath);
        } catch (Exception e) {
            throw new CustomException(S3ErrorCode.TMDB_IMAGE_UPLOAD_FAILED);
        }
    }

    public void deleteFile(String fileUrl) {
        log.info("deleteFile 메서드 시작");
        if (fileUrl == null || fileUrl.isEmpty()) {
            log.info("deleteFile에 fileUrl 비어있음");
            return;
        }

        String fileName = extractFileName(fileUrl);
        log.info("deleteFile 삭제할 이미지명 {}", fileName);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("deleteFile S3 파일 삭제 성공: {}", fileUrl);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {} - 오류: {}", fileUrl, e.getMessage());
            throw new CustomException(S3ErrorCode.S3_DELETE_FAILED);
        }
    }

    private String getUploadPath(Object entity, String originalFileName) {
        String folder;
        if (entity instanceof Cast){
            folder = "cast/";
        } else if (entity instanceof Content){
            folder = "content/";
        } else if (entity instanceof Place){
            folder = "place/";
        } else if (entity instanceof Post){
            folder = "post/";
        } else if (entity instanceof User){
            folder = "user/";
        } else if (entity instanceof CurationList){
            folder = "curationList/";
        } else {
            folder = "draft/";
        }
        return folder + UUID.randomUUID() + "-" + originalFileName;
    }

    // S3 우회 URL 반환
    public String getS3FileUrl(String filePath) {
        return String.format("https://d1qaf0hhk6y1ff.cloudfront.net/%s", filePath);
    }
    
    // tmdb 이미지 대상 (cast, content)
    private void setEntityImage(Object entity, String imageUrl) {
        if (entity instanceof Content) {
            Content content = (Content) entity;
            content.setImageUrl(imageUrl);
            contentRepository.save(content);
        } else if (entity instanceof Cast) {
            Cast cast = (Cast) entity;
            cast.setImageUrl(imageUrl);
            castRepository.save(cast);
        }
    }

    private String extractFileName(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            return url.getPath().substring(url.getPath().lastIndexOf("/") + 1);
        } catch (Exception e) {
            throw new RuntimeException("이미지 URL에서 파일명을 추출하는 중 오류 발생: " + imageUrl, e);
        }
    }

}