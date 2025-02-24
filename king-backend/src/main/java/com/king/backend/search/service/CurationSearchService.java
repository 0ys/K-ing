package com.king.backend.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.king.backend.domain.curation.entity.CurationListBookmark;
import com.king.backend.domain.curation.repository.CurationListBookmarkRepository;
import com.king.backend.domain.user.dto.domain.OAuth2UserDTO;
import com.king.backend.global.translate.TranslateService;
import com.king.backend.search.config.ElasticsearchConstants;
import com.king.backend.search.dto.request.CurationListSearchRequestDto;
import com.king.backend.search.dto.response.CurationListSearchResponseDto;
import com.king.backend.search.entity.CurationDocument;
import com.king.backend.search.util.CursorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CurationSearchService {

    private final CursorUtil cursorUtil;
    private static final String INDEX_NAME = ElasticsearchConstants.CURATION_INDEX;
    private final ElasticsearchClient elasticsearchClient;
    private final TranslateService translateService;
    private final CurationListBookmarkRepository curationListBookmarkRepository;

    /**
     * 큐레이션 리스트 제목 검색 및 전체 조회 (커서 기반 페이지네이션)
     *
     * @param requestDto 검색 요청 DTO (검색어, size, cursor 포함)
     * @return 검색 결과 DTO
     */
    public CurationListSearchResponseDto searchCurationLists(CurationListSearchRequestDto requestDto) {
        try {
            BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
            if (requestDto.getQuery() != null && !requestDto.getQuery().trim().isEmpty()) {
                boolQueryBuilder.must(m -> m.match(match -> match.field("title").query(requestDto.getQuery())));
            } else {
                boolQueryBuilder.must(m -> m.matchAll(ma -> ma));
            }

            boolQueryBuilder.filter(f -> f.term(t -> t.field("isPublic").value(true)));

            List<SortOptions> sortOptions = new ArrayList<>();
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("createdAt").order(SortOrder.Desc))));
            sortOptions.add(SortOptions.of(s -> s.field(f -> f.field("id").order(SortOrder.Asc))));

            SearchRequest.Builder searchRequestBuilder = new SearchRequest.Builder()
                    .index(INDEX_NAME)
                    .query(q -> q.bool(boolQueryBuilder.build()))
                    .size(10)
                    .sort(sortOptions);

            if (requestDto.getCursor() != null && !requestDto.getCursor().isEmpty()) {
                List<Object> searchAfterValues = cursorUtil.decodeCursor(requestDto.getCursor());
                List<FieldValue> fieldValues = searchAfterValues.stream().map(o -> {
                    if (o instanceof String) {
                        return FieldValue.of(f -> f.stringValue((String) o));
                    } else if (o instanceof Number) {
                        return FieldValue.of(f -> f.longValue(((Number) o).longValue()));
                    }
                    return FieldValue.of(f -> f.stringValue(o.toString()));
                }).collect(Collectors.toList());
                searchRequestBuilder.searchAfter(fieldValues);
            }

            SearchRequest searchRequest = searchRequestBuilder.build();
            SearchResponse<CurationDocument> searchResponse = elasticsearchClient.search(searchRequest, CurationDocument.class);

            List<Hit<CurationDocument>> hits = searchResponse.hits().hits();
            List<CurationListSearchResponseDto.CurationListItemDto> items = hits.stream()
                    .map(hit -> {
                        CurationDocument doc = hit.source();
                        return new CurationListSearchResponseDto.CurationListItemDto(
                                doc.getOriginalId(),
                                doc.getTitle(),
                                doc.getImageUrl(),
                                doc.getWriterNickname(),
                                false
                        );
                    })
                    .collect(Collectors.toList());

            String nextCursor = null;
            if (!hits.isEmpty()) {
                Hit<CurationDocument> lastHit = hits.get(hits.size() - 1);
                List<Object> lastSortValues = lastHit.sort().stream().map(fieldValue -> {
                    if (fieldValue.isString()) {
                        return fieldValue.stringValue();
                    } else if (fieldValue.isLong()) {
                        return fieldValue.longValue();
                    } else if (fieldValue.isDouble()) {
                        return fieldValue.doubleValue();
                    } else if (fieldValue.isBoolean()) {
                        return fieldValue.booleanValue();
                    }
                    return fieldValue.anyValue();
                }).collect(Collectors.toList());
                nextCursor = cursorUtil.encodeCursor(lastSortValues);
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            OAuth2UserDTO authUser = (OAuth2UserDTO) authentication.getPrincipal();
            Long userId = Long.parseLong(authUser.getName());
            String language = authUser.getLanguage();

            CurationListSearchResponseDto response = new CurationListSearchResponseDto(items, nextCursor);
            List<CurationListSearchResponseDto.CurationListItemDto> curationDTOs = response.getItems();

            Set<Long> curationIds = curationDTOs.stream()
                    .map(CurationListSearchResponseDto.CurationListItemDto::getId)
                    .collect(Collectors.toSet());
            List<CurationListBookmark> bookmarks =
                    curationListBookmarkRepository.findByUserIdAndCurationListIdIn(userId, curationIds);
            Set<Long> bookmarkedIds = bookmarks.stream()
                    .map(b -> b.getCurationList().getId())
                    .collect(Collectors.toSet());

            curationDTOs.forEach(dto -> dto.setBookmarked(bookmarkedIds.contains(dto.getId())));

            Map<String, String> originalText = new HashMap<>();
            List<String> keys = new ArrayList<>();

            curationDTOs.forEach((dto) -> {
                String key = "curation:" + dto.getId() + ":" + language + ":title";
                originalText.put(key, dto.getTitle());
                keys.add(key);
            });

            Map<String, String> translatedText = translateService.getTranslatedText(originalText, language);

            for (int i = 0; i < curationDTOs.size(); i++) {
                curationDTOs.get(i).setTitle(translatedText.get(keys.get(i)));
            }

            return response;

        } catch (IOException e) {
            return new CurationListSearchResponseDto(new ArrayList<>(), null);
        }
    }
}
