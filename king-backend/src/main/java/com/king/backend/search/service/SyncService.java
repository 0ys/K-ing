package com.king.backend.search.service;

import co.elastic.clients.elasticsearch._types.analysis.TokenFilter;
import co.elastic.clients.elasticsearch._types.analysis.TokenFilterDefinition;
import co.elastic.clients.elasticsearch._types.mapping.*;
import co.elastic.clients.elasticsearch.indices.IndexSettings;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.king.backend.domain.cast.entity.Cast;
import com.king.backend.domain.cast.repository.CastRepository;
import com.king.backend.domain.content.entity.Content;
import com.king.backend.domain.content.repository.ContentRepository;
import com.king.backend.domain.curation.entity.CurationList;
import com.king.backend.domain.curation.repository.CurationListRepository;
import com.king.backend.domain.place.entity.Place;
import com.king.backend.domain.place.repository.PlaceRepository;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.search.config.ElasticsearchConstants;
import com.king.backend.search.entity.CurationDocument;
import com.king.backend.search.entity.SearchDocument;
import com.king.backend.search.repository.ElasticsearchCurationListRepository;
import com.king.backend.search.repository.SearchRepository;
import com.king.backend.search.util.ElasticsearchUtil;
import com.king.backend.search.util.SearchDocumentBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 데이터 동기화 서비스 (MySQL <-> Elasticsearch)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyncService implements CommandLineRunner {

    private final CastRepository castRepository;
    private final ContentRepository contentRepository;
    private final PlaceRepository placeRepository;
    private final SearchRepository searchRepository;
    private final ElasticsearchUtil elasticsearchUtil;
    private final RedisUtil redisUtil;
    private final CurationListRepository curationListRepository;
    private final ElasticsearchCurationListRepository elasticsearchCurationListRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        settingBeforeSearchMigration();
        settingBeforeCurationMigration();
    }

    private void settingBeforeSearchMigration(){
        if (elasticsearchUtil.indexExists(ElasticsearchConstants.SEARCH_INDEX)) {
            elasticsearchUtil.deleteIndex(ElasticsearchConstants.SEARCH_INDEX);
        }

        Map<String, Property> properties = new HashMap<>();
        properties.put(ElasticsearchConstants.FIELD_ID, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_CATEGORY, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_TYPE, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build()); // Added 'type'
        properties.put(ElasticsearchConstants.FIELD_NAME, new Property.Builder().text(
                new TextProperty.Builder()
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE)
                        .searchAnalyzer("standard")
                        .fields(Map.of(
                                "keyword",new Property.Builder().keyword(new KeywordProperty.Builder().build()).build()
                        ))
                        .build()
        ).build());
        properties.put(ElasticsearchConstants.FIELD_DETAILS, new Property.Builder().text(new TextProperty.Builder().analyzer("standard").build()).build());
        properties.put(ElasticsearchConstants.FIELD_IMAGE_URL, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_ORIGINAL_ID, new Property.Builder().long_(new LongNumberProperty.Builder().build()).build());
        properties.put(ElasticsearchConstants.FIELD_POPULARITY, new Property.Builder().integer(new IntegerNumberProperty.Builder().build()).build()); // Added 'popularity'
        properties.put(ElasticsearchConstants.FIELD_CREATED_AT, new Property.Builder()
                .date(new DateProperty.Builder()
                        .format("yyyy-MM-dd'T'HH:mm:ss.SSSX")
                        .build())
                .build());
        properties.put("openHour", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("breakTime", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("closedDay", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
        properties.put("address", new Property.Builder().text(new TextProperty.Builder().analyzer("standard").build()).build());
        properties.put("location", new Property.Builder()
                .geoPoint(new GeoPointProperty.Builder().build())
                .build());
        properties.put("associatedCasts", new Property.Builder()
                .nested(nested -> nested
                        .properties(Map.of(
                                "castName", new Property.Builder()
                                        .keyword(new KeywordProperty.Builder().build())
                                        .build(),
                                "castDescription", new Property.Builder()
                                        .text(new TextProperty.Builder().analyzer("standard").build())
                                        .build()
                        ))
                )
                .build());
        properties.put("associatedContents", new Property.Builder()
                .nested(nested -> nested
                        .properties(Map.of(
                                "contentTitle", new Property.Builder()
                                        .keyword(new KeywordProperty.Builder().build())
                                        .build(),
                                "contentDescription", new Property.Builder()
                                        .text(new TextProperty.Builder().analyzer("standard").build())
                                        .build()
                        ))
                )
                .build());

        TokenFilterDefinition autocompleteFilterDefinition = TokenFilterDefinition.of(tf -> tf
                .ngram(ng -> ng
                        .minGram(1)
                        .maxGram(20)
                )
        );

        TokenFilter tokenFilter=TokenFilter.of(tf -> tf
                .definition(autocompleteFilterDefinition));

        Map<String, TokenFilter> tokenFiltersMap = new HashMap<>();
        tokenFiltersMap.put(ElasticsearchConstants.TOKEN_FILTER_AUTOCOMPLETE, tokenFilter);

        IndexSettings settings = new IndexSettings.Builder()
                        .analysis(analysis -> analysis
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE, a -> a
                                .custom(ca -> ca
                                        .tokenizer("standard")
                                        .filter("lowercase", ElasticsearchConstants.TOKEN_FILTER_AUTOCOMPLETE)
                                )
                        )
                        .filter(tokenFiltersMap)
                )
                .maxNgramDiff(20)
                .build();


        elasticsearchUtil.createIndex(ElasticsearchConstants.SEARCH_INDEX, properties,settings);

        migrateCasts();
        migrateContents();
        migratePlaces();
    }

    private void settingBeforeCurationMigration(){
        if (elasticsearchUtil.indexExists(ElasticsearchConstants.CURATION_INDEX)) {
            elasticsearchUtil.deleteIndex(ElasticsearchConstants.CURATION_INDEX);
        }
        Map<String, Property> properties = new HashMap<>();
        properties.put(ElasticsearchConstants.FIELD_ID, new Property.Builder()
                .keyword(new KeywordProperty.Builder().build())
                .build());
        properties.put("title", new Property.Builder()
                .text(new TextProperty.Builder()
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE)
                        .searchAnalyzer("standard")
                        .fields(Map.of(
                                "keyword", new Property.Builder()
                                        .keyword(new KeywordProperty.Builder().build())
                                        .build()
                        ))
                        .build())
                .build());

        properties.put("description", new Property.Builder()
                .text(new TextProperty.Builder()
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE)
                        .searchAnalyzer("standard")
                        .build())
                .build());
        properties.put("writerNickname", new Property.Builder()
                .keyword(new KeywordProperty.Builder().build())
                .build());
        properties.put("imageUrl", new Property.Builder()
                .keyword(new KeywordProperty.Builder().build())
                .build());
        properties.put(ElasticsearchConstants.FIELD_ORIGINAL_ID, new Property.Builder()
                .long_(new LongNumberProperty.Builder().build())
                .build());
        properties.put(ElasticsearchConstants.FIELD_CREATED_AT, new Property.Builder()
                .date(new DateProperty.Builder()
                        .format("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
                        .build())
                .build());
        properties.put("isPublic", new Property.Builder()
                .boolean_(new BooleanProperty.Builder().build())
                .build());

        TokenFilterDefinition autocompleteFilterDefinition = TokenFilterDefinition.of(tf -> tf
                .ngram(ng -> ng
                        .minGram(1)
                        .maxGram(20)
                )
        );

        TokenFilter tokenFilter=TokenFilter.of(tf -> tf
                .definition(autocompleteFilterDefinition));

        Map<String, TokenFilter> tokenFiltersMap = new HashMap<>();
        tokenFiltersMap.put(ElasticsearchConstants.TOKEN_FILTER_AUTOCOMPLETE, tokenFilter);

        IndexSettings settings = new IndexSettings.Builder()
                .analysis(analysis -> analysis
                        .analyzer(ElasticsearchConstants.ANALYZER_AUTOCOMPLETE, a -> a
                                .custom(ca -> ca
                                        .tokenizer("standard")
                                        .filter("lowercase", ElasticsearchConstants.TOKEN_FILTER_AUTOCOMPLETE)
                                )
                        )
                        .filter(tokenFiltersMap)
                )
                .maxNgramDiff(20)
                .build();

        elasticsearchUtil.createIndex(ElasticsearchConstants.CURATION_INDEX, properties,settings);

        migrateCurationLists();
    }

    private void migrateCurationLists(){
        List<CurationList> curationLists = curationListRepository.findAllWithWriter();
        List<CurationDocument> documents = curationLists.stream()
                .map(curation -> {
                    String writerNickname = curation.getWriter().getNickname();
                    return new CurationDocument(
                            "CURATION-" + curation.getId(),
                            curation.getTitle(),
                            curation.getDescription(),
                            writerNickname,
                            curation.getImageUrl(),
                            curation.getId(),
                            curation.getCreatedAt(),
                            curation.isPublic()
                    );
                })
                .collect(Collectors.toList());

        elasticsearchCurationListRepository.saveAll(documents);
    }

    /**
     * MySQL 데이터 변경 시 Elasticsearch 동기화 메소드
     * CurationList 데이터 저장
     */
    public void indexCurationList(CurationList curationList) {
        CurationDocument doc = new CurationDocument(
                "CURATION-" + curationList.getId(),
                curationList.getTitle(),
                curationList.getDescription(),
                curationList.getWriter().getNickname(),
                curationList.getImageUrl(),
                curationList.getId(),
                curationList.getCreatedAt(),
                curationList.isPublic()
        );
        elasticsearchCurationListRepository.save(doc);
    }

    /**
     * CurationList 인덱스 업데이트
     */
    public void updateCurationList(CurationList curationList) {
        indexCurationList(curationList);
    }

    /**
     * CurationList 인덱스 삭제
     */
    public void deleteCurationList(Long curationListId) {
        String documentId = "CURATION-" + curationListId;
        elasticsearchCurationListRepository.deleteById(documentId);
    }

    /**
     * Cast 데이터 마이그레이션
     */
    private void migrateCasts(){
        List<Cast> casts = castRepository.findAll();
        List<SearchDocument> documents = casts.stream()
                .map(SearchDocumentBuilder::fromCast)
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
    }

    /**
     * Content 데이터 마이그레이션
     */
    private void migrateContents(){
        List<Content> contents = contentRepository.findAll();
        List<SearchDocument> documents = contents.stream()
                .map(SearchDocumentBuilder::fromContent)
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
    }

    /**
     * Place 데이터 마이그레이션
     */
    private void migratePlaces() {
        // **중요**: fetch join 메서드를 사용하여 연관 데이터를 미리 가져옵니다.
        List<Place> places = placeRepository.findAll();

        // 강제로 초기화 (Hibernate.initialize() 사용)
        for (Place place : places) {
            if (place.getPlaceCasts() != null) {
                Hibernate.initialize(place.getPlaceCasts());
            }
            if (place.getPlaceContents() != null) {
                Hibernate.initialize(place.getPlaceContents());
            }

        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        List<SearchDocument> documents = places.stream()
                .map(place -> {
                    String key = "place:view:" + place.getId();
                    String viewCountStr = redisUtil.getValue(key);
                    int viewCount = 0;
                    if (viewCountStr != null) {
                        try {
                            viewCount = Integer.parseInt(viewCountStr);
                        } catch (NumberFormatException e) {
                            e.printStackTrace();
                        }
                    }
                    return SearchDocumentBuilder.fromPlace(place, viewCount);
                })
                .collect(Collectors.toList());
        searchRepository.saveAll(documents);
    }

    /**
     * MySQL 데이터 변경 시 Elasticsearch 동기화 메소드
     * Content 데이터 저장
     */
    public void indexContent(Content content) {
        SearchDocument doc = SearchDocumentBuilder.fromContent(content);
        searchRepository.save(doc);
    }

    /**
     * Content 인덱스 업데이트
     */
    public void updateContent(Content content) {
        indexContent(content);
    }

    /**
     * Content 인덱스 삭제
     */
    public void deleteContent(Long contentId) {
        String documentId = "CONTENT-" + contentId;
        searchRepository.deleteById(documentId);
    }

    /**
     * Cast 인덱싱 (생성 및 업데이트)
     */
    public void indexCast(Cast cast) {
        SearchDocument doc = SearchDocumentBuilder.fromCast(cast);
        searchRepository.save(doc);
    }

    /**
     * Cast 인덱스 업데이트
     */
    public void updateCast(Cast cast) {
        indexCast(cast);
    }

    /**
     * Cast 인덱스 삭제
     */
    public void deleteCast(Long castId) {
        String documentId = "CAST-" + castId;
        searchRepository.deleteById(documentId);
    }

    /**
     * Place 인덱싱 (생성 및 업데이트)
     */
    public void indexPlace(Place place) {
        String key = "place:view:" + place.getId();
        String viewCountStr = redisUtil.getValue(key);
        int viewCount = 0;
        if (viewCountStr != null) {
            try {
                viewCount = Integer.parseInt(viewCountStr);
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        SearchDocument doc = SearchDocumentBuilder.fromPlace(place, viewCount);
        searchRepository.save(doc);
    }

    /**
     * Place 인덱스 업데이트
     */
    public void updatePlace(Place place) {
        indexPlace(place);
    }

    /**
     * Place 인덱스 삭제
     */
    public void deletePlace(Long placeId) {
        String documentId = "PLACE-" + placeId;
        searchRepository.deleteById(documentId);
    }
}
