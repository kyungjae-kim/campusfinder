package com.bit.docker.admin.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDate;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class FoundServiceClient {
    private final WebClient foundServiceWebClient;
    
    public long countByDateRange(LocalDate startDate, LocalDate endDate) {
        try {
            log.debug("Found 서비스 통계 조회 - startDate: {}, endDate: {}", startDate, endDate);
            
            Map<String, Long> response = foundServiceWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                    .path("/count")
                    .queryParam("startDate", startDate)
                    .queryParam("endDate", endDate)
                    .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Long>>() {})
                .block();
            
            if (response == null || !response.containsKey("count")) {
                log.warn("Found 서비스 응답이 null이거나 count 필드가 없습니다.");
                return 0L;
            }
            
            Long count = response.get("count");
            log.debug("Found 서비스 통계 조회 성공 - count: {}", count);
            return count != null ? count : 0L;
            
        } catch (WebClientResponseException e) {
            log.error("Found 서비스 호출 실패 - Status: {}, Body: {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
            return 0L;
        } catch (Exception e) {
            log.error("Found 서비스 통계 조회 중 예외 발생", e);
            return 0L;
        }
    }
}
