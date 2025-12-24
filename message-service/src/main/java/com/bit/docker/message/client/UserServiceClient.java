package com.bit.docker.message.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class UserServiceClient {
    private final WebClient userServiceWebClient;
    
    public boolean isUserBlocked(Long userId) {
        try {
            Boolean blocked = userServiceWebClient
                .get()
                .uri("/{userId}/blocked", userId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .block();
            return blocked != null && blocked;
        } catch (Exception e) {
            // 조회 실패 시 차단되지 않은 것으로 간주
            return false;
        }
    }
}
