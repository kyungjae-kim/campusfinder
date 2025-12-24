package com.bit.docker.message.dto.response;

import com.bit.docker.message.model.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long handoverId;
    private Long senderId;
    private String content;
    private Boolean isRead;
    private LocalDateTime readAt;
    private Boolean isReported;
    private Boolean isBlinded;
    private LocalDateTime createdAt;
    
    public static MessageResponse from(Message message) {
        return new MessageResponse(
            message.getId(),
            message.getHandoverId(),
            message.getSenderId(),
            message.getContent(),
            message.getIsRead(),
            message.getReadAt(),
            message.getIsReported(),
            message.getIsBlinded(),
            message.getCreatedAt()
        );
    }
}
