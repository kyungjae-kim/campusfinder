package com.bit.docker.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequest {
    private Long userId;
    private String type;
    private String title;
    private String message;
    private Long relatedId;
}
