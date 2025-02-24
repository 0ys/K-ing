package com.king.backend.search.repository;

import com.king.backend.search.entity.CurationDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ElasticsearchCurationListRepository extends ElasticsearchRepository<CurationDocument, String> {
}