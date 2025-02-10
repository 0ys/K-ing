package com.king.backend.domain.place.controller;

import com.king.backend.domain.place.dto.response.PlaceIdResponseDto;
import com.king.backend.global.util.RedisUtil;
import com.king.backend.domain.place.dto.response.PlaceDetailResponseDto;
import com.king.backend.domain.place.errorcode.PlaceErrorCode;
import com.king.backend.domain.place.service.PlaceService;
import com.king.backend.global.exception.CustomException;
import com.king.backend.global.response.ApiResponse;
import com.king.backend.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/place")
@Slf4j
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;
    private final RedisUtil redisUtil;
    private final SearchService searchService;

    // 공통 응답 모듈 테스트
    @Operation(summary = "성공 응답 확인용 API")
    @GetMapping("/success")
    public ResponseEntity<ApiResponse<String>> getSuccessResponse() {
        log.info("GET /api/place/success 요청 처리 시작");
        ResponseEntity<ApiResponse<String>> response = ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("장소 조회 성공 반환 data"));
        log.info("GET /api/place/success 요청 처리 완료: {}", response.getBody());
        return response;
    }

    @Operation(summary = "에러 응답 확인용 API")
    @GetMapping("/error")
    public ResponseEntity<ApiResponse<String>> getErrorResponse() {
        // 예외 처리 로그 필요 X (GlobalExceptionHandler에서 에러코드, 메세지 로그 출력됨)
        throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
    }

    // 장소 상세 정보 조회
    @Operation(summary = "장소 상세 조회 API")
    @GetMapping("/{placeId}")
    public ResponseEntity<ApiResponse<PlaceDetailResponseDto>> getPlaceDetail(@PathVariable Long placeId){
        log.info("GET /api/place/{} 요청 처리 시작", placeId);
        PlaceDetailResponseDto dto = placeService.getPlaceDetail(placeId);
        try{
            String key = "place:view:"+placeId;
            redisUtil.incrementValue(key);

            String viewCountStr = redisUtil.getValue(key);
            int viewCount = 0;
            if(viewCountStr != null){
                try{
                    viewCount = Integer.parseInt(viewCountStr);
                }catch(NumberFormatException e){
                    log.warn("Invalid view count for place {}: {}", placeId, viewCountStr);
                }
            }

            searchService.updatePlacePopularity(placeId,viewCount);

            return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(dto));
        }catch(Exception e){
            throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
        }
    }

    @Operation(summary = "장소 이름으로 placeId 조회 API")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PlaceIdResponseDto>> getPlaceIdByName(@RequestParam String name) {
        log.info("GET /api/place/search 요청 처리 시작 - 장소명: {}", name);

        PlaceIdResponseDto responseDto = placeService.getPlaceIdByName(name);
        if (responseDto == null) {
            throw new CustomException(PlaceErrorCode.PLACE_NOT_FOUND);
        }

        log.info("GET /api/place/search 요청 완료 - placeId: {}", responseDto.getPlaceId());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(responseDto));
    }
}
