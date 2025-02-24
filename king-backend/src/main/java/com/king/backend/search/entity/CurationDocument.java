package com.king.backend.search.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "curation-index", createIndex = false)
@JsonIgnoreProperties(value = "_class", allowGetters = true)
public class CurationDocument {
    /**
     * 문서 ID 예) "curation-123"
     */
    private String id;

    /**
     * 큐레이션 리스트 제목
     */
    private String title;

    /**
     * 큐레이션 설명
     */
    private String description;

    /**
     * 작성자 닉네임 (예, "@홍길동")
     */
    private String writerNickname;

    /**
     * 큐레이션 리스트 이미지 URL
     */
    private String imageUrl;

    /**
     * MySQL의 큐레이션 리스트 고유 id
     */
    private Long originalId;

    /**
     * 생성일시 (최신순 정렬 기준)
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    @Field(type = FieldType.Date,
            format = DateFormat.date_optional_time,
            pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    /**
     * 공개 여부 (true: 공개, false: 비공개)
     */
    private Boolean isPublic;
}
