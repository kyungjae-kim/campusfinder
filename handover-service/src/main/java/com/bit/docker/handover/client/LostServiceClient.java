package com.bit.docker.handover.client;

import com.bit.docker.handover.dto.LostItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class LostServiceClient {
    private final WebClient lostServiceWebClient;
    
    public LostItemDTO getLostItem(Long lostId) {
        try {
            return lostServiceWebClient
                .get()
                .uri("/{id}", lostId)
                .retrieve()
                .bodyToMono(LostItemDTO.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("분실 신고를 조회할 수 없습니다: " + e.getMessage());
        }
    }
    
    public void updateStatus(Long lostId, String status) {
        try {
            lostServiceWebClient
                .put()
                .uri("/{id}/status", lostId)
                .bodyValue(Map.of("status", status))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("분실 신고 상태 업데이트 실패: " + e.getMessage());
        }
    }
}
