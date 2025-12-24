package com.bit.docker.handover.dto.response;

import com.bit.docker.handover.model.Handover;
import com.bit.docker.handover.model.HandoverMethod;
import com.bit.docker.handover.model.HandoverStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HandoverResponse {
    private Long id;
    private Long lostId;
    private Long foundId;
    private Long requesterId;
    private Long responderId;
    private HandoverMethod method;
    private HandoverStatus status;
    private LocalDateTime scheduleAt;
    private String meetPlace;
    private LocalDateTime acceptedByFinderAt;
    private LocalDateTime verifiedBySecurityAt;
    private LocalDateTime approvedByOfficeAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;
    private String cancelReason;
    private Boolean contactDisclosed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HandoverResponse from(Handover handover) {
        return new HandoverResponse(
            handover.getId(),
            handover.getLostId(),
            handover.getFoundId(),
            handover.getRequesterId(),
            handover.getResponderId(),
            handover.getMethod(),
            handover.getStatus(),
            handover.getScheduleAt(),
            handover.getMeetPlace(),
            handover.getAcceptedByFinderAt(),
            handover.getVerifiedBySecurityAt(),
            handover.getApprovedByOfficeAt(),
            handover.getCompletedAt(),
            handover.getCanceledAt(),
            handover.getCancelReason(),
            handover.getContactDisclosed(),
            handover.getCreatedAt(),
            handover.getUpdatedAt()
        );
    }
}
