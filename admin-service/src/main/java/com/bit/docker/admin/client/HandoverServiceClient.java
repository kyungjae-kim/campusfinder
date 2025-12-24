package com.bit.docker.admin.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class HandoverServiceClient {
    private final WebClient handoverServiceWebClient;
    
    public long countCompleted(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            Map<String, Long> response = handoverServiceWebClient
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
