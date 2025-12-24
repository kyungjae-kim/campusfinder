package com.bit.docker.message.client;

import com.bit.docker.message.dto.HandoverDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class HandoverServiceClient {
    private final WebClient handoverServiceWebClient;
    
    public HandoverDTO getHandover(Long handoverId) {
        try {
            return handoverServiceWebClient
                .get()
                .uri("/{id}", handoverId)
                .retrieve()
                .bodyToMono(HandoverDTO.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("인계 정보를 조회할 수 없습니다: " + e.getMessage());
        }
    }
    
    public boolean isParticipant(Long handoverId, Long userId) {
        try {
            HandoverDTO handover = getHandover(handoverId);
            return handover.getRequesterId().equals(userId) || handover.getResponderId().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }
}
