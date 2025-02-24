package com.king.backend.search.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.*;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Elasticsearch 도큐먼트 매핑
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "search-index", createIndex = false)
@JsonIgnoreProperties(value = "_class", allowGetters = true)
public class SearchDocument {
    @Id
    private String id;
    private String category;
    private String type;
    private String name;
    private String details;
    private String imageUrl;
    private Long originalId;
    private int popularity;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    @Field(type = FieldType.Date,
            format = DateFormat.date_optional_time,
            pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime createdAt;

    private String openHour;
    private String breakTime;
    private String closedDay;
    private String address;

    @JsonSerialize(using = GeoPointJsonSerializer.class)
    @GeoPointField
    private GeoPoint location;

    @Field(type = FieldType.Nested)
    private List<AssociatedCast> associatedCasts;

    @Field(type = FieldType.Nested)
    private List<AssociatedContent> associatedContents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssociatedCast {
        private String castName;
        private String castDescription;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssociatedContent {
        private String contentTitle;
        private String contentDescription;
    }
}
