package com.bit.docker.notification.service;

import com.bit.docker.notification.dto.request.NotificationCreateRequest;
import com.bit.docker.notification.dto.response.NotificationResponse;
import com.bit.docker.notification.model.Notification;
import com.bit.docker.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    private final NotificationRepository notificationRepository;
    
    // 알림 생성 (다른 서비스에서 호출)
    @Transactional
    public NotificationResponse createNotification(NotificationCreateRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        notification.setRelatedLostId(request.getRelatedLostId());
        notification.setRelatedFoundId(request.getRelatedFoundId());
        notification.setRelatedHandoverId(request.getRelatedHandoverId());
        notification.setIsRead(false);
        
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.from(saved);
    }
    
    // 내 알림함 조회
    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(NotificationResponse::from)
            .collect(Collectors.toList());
    }
    
    // 내 알림함 조회 (페이지네이션)
    public Page<NotificationResponse> getMyNotificationsPaged(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(NotificationResponse::from);
    }
    
    // 읽지 않은 알림 조회
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
            .map(NotificationResponse::from)
            .collect(Collectors.toList());
    }
    
    // 읽지 않은 알림 개수
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    // 알림 읽음 처리
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
        
        // 권한 확인
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        return NotificationResponse.from(notification);
    }
    
    // 모든 알림 읽음 처리
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = 
            notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(now);
        }
    }
    
    // 알림 삭제
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
        
        // 권한 확인
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        
        notificationRepository.delete(notification);
    }
}
