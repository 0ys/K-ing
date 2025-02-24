package com.king.backend.datasetting.scheduler;

import com.king.backend.datasetting.service.PublicDataService;
import com.king.backend.datasetting.service.TmdbService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PublicDataScheduler {

    private final PublicDataService publicDataService;
    private final TmdbService tmdbService;


    /**
     * 애플리케이션 시작 시 한 번 공공 데이터 API 호출
     */
    @PostConstruct
    public void init() {
        System.out.println("----- [PublicDataScheduler] 애플리케이션 시작 시 공공 데이터 수집 실행 -----");
//        processData();
    }

//    @Scheduled(fixedDelayString = "${app.scheduler.public-data-interval}")
    public void processData(){
//        System.out.println("===== TMDB 영화 데이터 업데이트 시작 =====");
//        tmdbService.fetchAndSavePopularMovies();
//        System.out.println("===== TMDB 영화 데이터 업데이트 완료 =====");
//
//        System.out.println("===== TMDB TV 프로그램 데이터 업데이트 시작 =====");
//        tmdbService.fetchAndSavePopularTVPrograms();
//        System.out.println("===== TMDB TV 프로그램 데이터 업데이트 완료 =====");
//
//        System.out.println("===== 크레딧 데이터 업데이트 시작 =====");
//        tmdbService.fetchAndSaveCastFromContent();
//        System.out.println("===== 크레딧 데이터 업데이트 완료 =====");

//        System.out.println("===== content_cast 테이블 업데이트 시작 =====");
//        tmdbService.populateContentCast();
//        System.out.println("===== content_cast 테이블 업데이트 완료 =====");

//        System.out.println("----- [PublicDataScheduler] 공공 데이터 수집 시작 -----");
//        List<Place> places = publicDataService.fetchAndSaveAllPublicData();
//        System.out.println("수집 완료: " + places.size() + "건");

    }

}
