package com.bit.docker.admin.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class UserServiceClient {
    private final WebClient userServiceWebClient;
    
    public void blockUser(Long userId) {
        try {
            userServiceWebClient
                .post()
                .uri("/{userId}/block", userId)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("사용자 정지 실패: " + e.getMessage());
        }
    }
    
    public void unblockUser(Long userId) {
        try {
            userServiceWebClient
                .post()
                .uri("/{userId}/unblock", userId)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
        } catch (Exception e) {
            throw new RuntimeException("사용자 정지 해제 실패: " + e.getMessage());
        }
    }
}
