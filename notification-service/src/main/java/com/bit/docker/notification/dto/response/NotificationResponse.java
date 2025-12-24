package com.bit.docker.notification.dto.response;

import com.bit.docker.notification.model.Notification;
import com.bit.docker.notification.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String content;
    private Long relatedLostId;
    private Long relatedFoundId;
    private Long relatedHandoverId;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getUserId(),
            notification.getType(),
            notification.getTitle(),
            notification.getContent(),
            notification.getRelatedLostId(),
            notification.getRelatedFoundId(),
            notification.getRelatedHandoverId(),
            notification.getIsRead(),
            notification.getReadAt(),
            notification.getCreatedAt()
        );
    }
}
