package com.bit.docker.notification.controller;

import com.bit.docker.notification.dto.request.NotificationCreateRequest;
import com.bit.docker.notification.dto.response.NotificationResponse;
import com.bit.docker.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    
    // 알림 생성 (내부 서비스 호출용)
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
        @RequestBody NotificationCreateRequest request
    ) {
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 내 알림함 조회
    @GetMapping("/my")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<NotificationResponse> response = notificationService.getMyNotifications(userId);
        return ResponseEntity.ok(response);
    }
    
    // 내 알림함 조회 (페이지네이션)
    @GetMapping("/my/paged")
    public ResponseEntity<Page<NotificationResponse>> getMyNotificationsPaged(
        @RequestHeader("X-User-Id") Long userId,
        Pageable pageable
    ) {
        Page<NotificationResponse> response = notificationService.getMyNotificationsPaged(userId, pageable);
        return ResponseEntity.ok(response);
    }
    
    // 읽지 않은 알림 조회
    @GetMapping("/my/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<NotificationResponse> response = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(response);
    }
    
    // 읽지 않은 알림 개수
    @GetMapping("/my/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
        @RequestHeader("X-User-Id") Long userId
    ) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    // 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
        @PathVariable Long notificationId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        NotificationResponse response = notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.ok(response);
    }
    
    // 모든 알림 읽음 처리
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
        @RequestHeader("X-User-Id") Long userId
    ) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    // 알림 삭제
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
        @PathVariable Long notificationId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        notificationService.deleteNotification(notificationId, userId);
        return ResponseEntity.noContent().build();
    }
}
