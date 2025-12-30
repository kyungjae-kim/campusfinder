package com.bit.docker.admin.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class FoundServiceClient {
    private final WebClient foundServiceWebClient;
    
    public long countByDateRange(LocalDate startDate, LocalDate endDate) {
        try {
            Map<String, Long> response = foundServiceWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                    .path("/count")
                    .queryParam("startDate", startDate)
                    .queryParam("endDate", endDate)
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            return response != null ? response.get("count") : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }
}
