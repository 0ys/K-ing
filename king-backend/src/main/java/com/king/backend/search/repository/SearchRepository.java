package com.king.backend.search.repository;

import com.king.backend.search.entity.SearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Elasticsearch Repository
 */
@Repository
public interface SearchRepository extends ElasticsearchRepository<SearchDocument, String> {
    List<SearchDocument> findByNameContaining(String name);
    List<SearchDocument> findByCategory(String category);
}
