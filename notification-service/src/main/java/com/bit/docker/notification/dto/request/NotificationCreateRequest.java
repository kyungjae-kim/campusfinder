package com.bit.docker.notification.dto.request;

import com.bit.docker.notification.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequest {
    private Long userId;
    private NotificationType type;
    private String title;
    private String content;
    private Long relatedLostId;
    private Long relatedFoundId;
    private Long relatedHandoverId;
}
