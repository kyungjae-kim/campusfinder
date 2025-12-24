package com.bit.docker.handover.client;

import com.bit.docker.handover.dto.FoundItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class FoundServiceClient {
    private final WebClient foundServiceWebClient;
    
    public FoundItemDTO getFoundItem(Long foundId) {
        try {
            return foundServiceWebClient
                .get()
                .uri("/{id}", foundId)
                .retrieve()
                .bodyToMono(FoundItemDTO.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("습득물을 조회할 수 없습니다: " + e.getMessage());
        }
    }
    
    public void updateStatus(Long foundId, String status) {
        try {
            foundServiceWebClient
                .put()
                .uri("/{id}/status", foundId)
                .bodyValue(Map.of("status", status))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("습득물 상태 업데이트 실패: " + e.getMessage());
        }
    }
}
