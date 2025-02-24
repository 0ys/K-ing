package com.king.backend.search.repository;

import com.king.backend.search.entity.SearchRanking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchRankingRepository extends JpaRepository<SearchRanking, Integer> {
    List<SearchRanking> findByPeriodOrderByRankAsc(String period);
}
