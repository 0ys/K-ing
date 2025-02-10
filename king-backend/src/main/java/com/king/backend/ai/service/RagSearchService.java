package com.king.backend.ai.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.king.backend.ai.dto.CurationSearchResponseDto;
import com.king.backend.ai.dto.PlaceSearchResponseDto;
import com.king.backend.ai.dto.RagSearchRequestDto;
import com.king.backend.search.config.ElasticsearchConstants;
import com.king.backend.search.entity.SearchDocument;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagSearchService {
    private final ElasticsearchClient elasticsearchClient;

    public RagSearchService(ElasticsearchClient elasticsearchClient) {
        this.elasticsearchClient = elasticsearchClient;
    }

    /**
     * 장소 검색
     * - "search-index"에서 category가 "PLACE"인 도큐먼트만 대상으로 함
     * - place의 name, details, address 및 연결된(associated) Cast/Content의 각 이름/설명 필드를 대상으로 match_phrase 쿼리 적용
     * - 반환 결과의 relatedName, description은 연결된 Cast/Content 중 키워드가 완전한 단어로 포함된 항목의 값을 사용 (발견되지 않으면 빈 값)
     */
    public PlaceSearchResponseDto search(RagSearchRequestDto requestDto) {
        try {
            // ES 검색 쿼리 구성
            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(ElasticsearchConstants.SEARCH_INDEX)
                    .query(q -> q.bool(b -> b
                            // category 필터: PLACE 도큐먼트만 검색
                            .filter(f -> f.term(t -> t.field("category").value("PLACE")))
                            // 연결된 Cast 검색 (nested query)
                            .should(s1 -> s1.nested(n -> n
                                    .path("associatedCasts")
                                    .query(nq -> nq.bool(bq -> bq
                                            .should(sh -> sh.match(m -> m
                                                    .field("associatedCasts.castName")
                                                    .query(requestDto.getKeywords())
                                            ))
                                            .should(sh -> sh.match(m -> m
                                                    .field("associatedCasts.castDescription")
                                                    .query(requestDto.getKeywords())
                                            ))
                                    ))
                            ))
                            // 연결된 Content 검색 (nested query)
                            .should(s1 -> s1.nested(n -> n
                                    .path("associatedContents")
                                    .query(nq -> nq.bool(bq -> bq
                                            .should(sh -> sh.match(m -> m
                                                    .field("associatedContents.contentTitle")
                                                    .query(requestDto.getKeywords())
                                            ))
                                            .should(sh -> sh.match(m -> m
                                                    .field("associatedContents.contentDescription")
                                                    .query(requestDto.getKeywords())
                                            ))
                                    ))
                            ))
                            // 위 should 조건 중 최소 1개 이상 매치되어야 함
                            .minimumShouldMatch("1")
                    ))
            );

            SearchResponse<SearchDocument> searchResponse =
                    elasticsearchClient.search(searchRequest, SearchDocument.class);

            // 검색 결과 도큐먼트를 PlaceResult로 매핑
            List<PlaceSearchResponseDto.PlaceResult> results = searchResponse.hits().hits().stream().map(hit -> {
                SearchDocument doc = hit.source();
                PlaceSearchResponseDto.PlaceResult result = new PlaceSearchResponseDto.PlaceResult();
                result.setPlaceId(doc.getOriginalId());
                result.setName(doc.getName());
                result.setType(doc.getType());
                result.setAddress(doc.getAddress());
                result.setLat(doc.getLat());
                result.setLng(doc.getLng());
                result.setImageUrl(doc.getImageUrl());

                // 연결된 Cast 또는 Content 중 키워드가 포함된 항목에서 값을 추출
                String relatedName = "";
                String relatedDescription = "";
                boolean nestedMatched = false;

                // 우선 associatedCasts에서 확인
                if (doc.getAssociatedCasts() != null) {
                    for (SearchDocument.AssociatedCast ac : doc.getAssociatedCasts()) {
                        if ((ac.getCastName() != null && ac.getCastName().contains(requestDto.getKeywords())) ||
                                (ac.getCastDescription() != null && ac.getCastDescription().contains(requestDto.getKeywords()))) {
                            relatedName = ac.getCastName();
                            relatedDescription = ac.getCastDescription();
                            nestedMatched = true;
                            break;
                        }
                    }
                }
                // 연결된 Cast에서 매치되지 않았다면 associatedContents에서 확인
                if (!nestedMatched && doc.getAssociatedContents() != null) {
                    for (SearchDocument.AssociatedContent ac : doc.getAssociatedContents()) {
                        if ((ac.getContentTitle() != null && ac.getContentTitle().contains(requestDto.getKeywords())) ||
                                (ac.getContentDescription() != null && ac.getContentDescription().contains(requestDto.getKeywords()))) {
                            relatedName = ac.getContentTitle();
                            relatedDescription = ac.getContentDescription();
                            break;
                        }
                    }
                }
                result.setRelatedName(relatedName);
                result.setDescription(relatedDescription);
                return result;
            }).collect(Collectors.toList());

            return new PlaceSearchResponseDto(results);
        } catch (IOException e) {
            throw new RuntimeException("Elasticsearch 검색 실패", e);
        }
    }

    public CurationSearchResponseDto searchCurations(RagSearchRequestDto requestDto) {
        return null;
    }
}
