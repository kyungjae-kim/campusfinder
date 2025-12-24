package com.bit.docker.notification.repository;

import com.bit.docker.notification.model.Notification;
import com.bit.docker.notification.model.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // 사용자별 알림 조회
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // 읽지 않은 알림 조회
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    // 읽지 않은 알림 개수
    long countByUserIdAndIsReadFalse(Long userId);
    
    // 알림 타입별 조회
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(
        Long userId, NotificationType type, Pageable pageable
    );
}
