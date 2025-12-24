package com.bit.docker.handover.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationServiceClient {
    private final WebClient notificationServiceWebClient;
    
    public void sendNotification(Long userId, String type, String title, String content, Long relatedHandoverId) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("type", type);
            body.put("title", title);
            body.put("content", content);
            if (relatedHandoverId != null) {
                body.put("relatedHandoverId", relatedHandoverId);
            }
            
            notificationServiceWebClient
                .post()
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
        } catch (Exception e) {
            // 알림 실패는 무시 (핵심 기능 아님)
            System.err.println("알림 전송 실패: " + e.getMessage());
        }
    }
}
