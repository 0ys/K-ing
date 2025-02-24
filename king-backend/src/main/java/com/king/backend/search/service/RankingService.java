package com.king.backend.search.service;

import com.king.backend.search.dto.response.RankingDto;
import com.king.backend.search.entity.SearchRanking;
import com.king.backend.search.repository.SearchRankingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class RankingService {
    private final RedisTemplate<String, String> redisTemplate;
    private final SearchRankingRepository searchRankingRepository;

    private final Map<String, AtomicInteger> keywordBatchCache = new ConcurrentHashMap<>();

    private static final String REALTIME_RANKING_KEY = "search:ranking:realtime";

    private static final double DECAY_FACTOR = 0.99; // 실시간 점수를 1분마다 0.99배 (1%씩 감소)
    private static final double RECENT_WEIGHT = 1.0;   // 신규 검색 이벤트 1건당 가중치

    public RankingService(RedisTemplate<String, String> redisTemplate,
                          SearchRankingRepository searchRankingRepository) {
        this.redisTemplate = redisTemplate;
        this.searchRankingRepository = searchRankingRepository;
    }

    private String getDailyRankingKey() {
        return "search:ranking:daily:" + LocalDate.now().format(DateTimeFormatter.ISO_DATE);
    }

    private String getWeeklyRankingKey() {
        LocalDate now = LocalDate.now();
        int week = now.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = now.getYear();
        return "search:ranking:weekly:" + year + "-W" + week;
    }

    /**
     * 검색어 입력 시 처리
     * 사용자가 검색할 때마다 메모리 캐시에 검색어의 카운트를 누적합니다.
     *
     * @param keyword 검색어
     */
    public void incrementKeywordCount(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return;
        keyword = keyword.trim();

        // 메모리 캐시에 누적 (스레드 안전한 방식)
        keywordBatchCache.computeIfAbsent(keyword, k -> new AtomicInteger(0))
                .incrementAndGet();
    }

    /**
     * 매 1분마다 실행되는 배치 작업
     * Redis의 REALTIME_RANKING_KEY에 대해 감쇠(decay) 처리를 적용하여 서서히 점수를 감소시키고,
     * 메모리 캐시에 누적된 신규 검색 이벤트를 REALTIME, DAILY, WEEKLY 키에 반영합니다.
     */
    @Scheduled(fixedRate = 60000)
    @Async("rankingTaskExecutor")
    public void flushBatchUpdates() {
        // 일별, 주간 키 생성
        String dailyKey = getDailyRankingKey();
        String weeklyKey = getWeeklyRankingKey();

        // 실시간 키에 저장된 현재 점수들을 가져옵니다.
        Set<ZSetOperations.TypedTuple<String>> currentRankings =
                redisTemplate.opsForZSet().rangeWithScores(REALTIME_RANKING_KEY, 0, -1);

        // 파이프라인을 이용해 여러 Redis 명령을 한 번에 실행합니다.
        redisTemplate.executePipelined(new SessionCallback<Object>() {
            @Override
            public Object execute(RedisOperations operations) throws DataAccessException {
                // 1. 실시간 키에 대해 감쇠(decay) 처리: 각 검색어의 점수를 DECAY_FACTOR만큼 감소시킵니다.
                if (currentRankings != null) {
                    for (ZSetOperations.TypedTuple<String> tuple : currentRankings) {
                        String keyword = tuple.getValue();
                        double oldScore = tuple.getScore() != null ? tuple.getScore() : 0.0;
                        double decayedScore = oldScore * DECAY_FACTOR;
                        // add()로 기존 점수를 갱신합니다.
                        operations.opsForZSet().add(REALTIME_RANKING_KEY, keyword, decayedScore);
                    }
                }

                // 2. 메모리 캐시에 누적된 신규 검색 이벤트 반영
                // (배치 작업 전에 캐시를 복사하고 초기화하여 동시성 문제 방지)
                Map<String, AtomicInteger> batchCopy = new ConcurrentHashMap<>(keywordBatchCache);
                keywordBatchCache.clear();
                for (Map.Entry<String, AtomicInteger> entry : batchCopy.entrySet()) {
                    String keyword = entry.getKey();
                    int count = entry.getValue().get();
                    double increment = count * RECENT_WEIGHT;
                    // 각 키에 신규 이벤트 가중치를 추가합니다.
                    operations.opsForZSet().incrementScore(REALTIME_RANKING_KEY, keyword, increment);
                    operations.opsForZSet().incrementScore(dailyKey, keyword, increment);
                    operations.opsForZSet().incrementScore(weeklyKey, keyword, increment);
                }

                // 3. 일별, 주간 키에 만료시간 설정 (데이터가 누적된 후 자동으로 제거)
                operations.expire(dailyKey, Duration.ofDays(2));
                operations.expire(weeklyKey, Duration.ofDays(8));
                return null;
            }
        });
    }

    /**
     * 지정한 기간(period)의 랭킹 데이터를 Redis에서 조회합니다.
     * @param period "realtime", "daily", "weekly"
     * @return 상위 10건의 랭킹 목록
     */
    public List<RankingDto> getRanking(String period) {
        String key;
        switch (period.toLowerCase()) {
            case "daily":
                key = getDailyRankingKey();
                break;
            case "weekly":
                key = getWeeklyRankingKey();
                break;
            case "realtime":
            default:
                key = REALTIME_RANKING_KEY;
                break;
        }

        Set<ZSetOperations.TypedTuple<String>> rankingSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 7);
        List<RankingDto> rankingList = new ArrayList<>();
        if (rankingSet != null) {
            int rank = 1;
            for (ZSetOperations.TypedTuple<String> tuple : rankingSet) {
                String keyword = tuple.getValue();
                rankingList.add(new RankingDto(keyword, rank));
                rank++;
            }
        }
        return rankingList;
    }

    /**
     * 매일 자정에 Redis의 일별 랭킹 데이터를 MySQL에 저장합니다.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Async("rankingTaskExecutor")
    public void persistDailyRanking() {
        String dailyKey = getDailyRankingKey();
        Set<ZSetOperations.TypedTuple<String>> rankingSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(dailyKey, 0, -1);
        if (rankingSet != null) {
            int rank = 1;
            LocalDateTime now = LocalDateTime.now();
            List<SearchRanking> rankings = new ArrayList<>();
            for (ZSetOperations.TypedTuple<String> tuple : rankingSet) {
                String keyword = tuple.getValue();
                int searchCount = tuple.getScore() != null ? (int) Math.round(tuple.getScore()) : 0;
                double score = tuple.getScore() != null ? tuple.getScore() : 0.0;
                SearchRanking ranking = SearchRanking.builder()
                        .keyword(keyword)
                        .period("daily")
                        .rank(rank)
                        .searchCount(searchCount)
                        .score(score)
                        .date(now)
                        .build();
                rankings.add(ranking);
                rank++;
            }
            searchRankingRepository.saveAll(rankings);
        }
    }

    /**
     * 매주 월요일 00:10분에 Redis의 주간 랭킹 데이터를 MySQL에 저장합니다.
     */
    @Scheduled(cron = "0 10 0 * * MON")
    public void persistWeeklyRanking() {
        String weeklyKey = getWeeklyRankingKey();
        Set<ZSetOperations.TypedTuple<String>> rankingSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(weeklyKey, 0, -1);
        if (rankingSet != null) {
            int rank = 1;
            LocalDateTime now = LocalDateTime.now();
            List<SearchRanking> rankings = new ArrayList<>();
            for (ZSetOperations.TypedTuple<String> tuple : rankingSet) {
                String keyword = tuple.getValue();
                int searchCount = tuple.getScore() != null ? (int) Math.round(tuple.getScore()) : 0;
                double score = tuple.getScore() != null ? tuple.getScore() : 0.0;
                SearchRanking ranking = SearchRanking.builder()
                        .keyword(keyword)
                        .period("weekly")
                        .rank(rank)
                        .searchCount(searchCount)
                        .score(score)
                        .date(now)
                        .build();
                rankings.add(ranking);
                rank++;
            }
            searchRankingRepository.saveAll(rankings);
        }
    }
}
