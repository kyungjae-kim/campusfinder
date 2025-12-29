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
    
    // 추가 정보 (외부 서비스에서 조회)
    private String lostTitle;
    private String foundTitle;
    private String requesterName;
    private String responderName;

    public static HandoverResponse from(Handover handover) {
        HandoverResponse response = new HandoverResponse();
        response.setId(handover.getId());
        response.setLostId(handover.getLostId());
        response.setFoundId(handover.getFoundId());
        response.setRequesterId(handover.getRequesterId());
        response.setResponderId(handover.getResponderId());
        response.setMethod(handover.getMethod());
        response.setStatus(handover.getStatus());
        response.setScheduleAt(handover.getScheduleAt());
        response.setMeetPlace(handover.getMeetPlace());
        response.setAcceptedByFinderAt(handover.getAcceptedByFinderAt());
        response.setVerifiedBySecurityAt(handover.getVerifiedBySecurityAt());
        response.setApprovedByOfficeAt(handover.getApprovedByOfficeAt());
        response.setCompletedAt(handover.getCompletedAt());
        response.setCanceledAt(handover.getCanceledAt());
        response.setCancelReason(handover.getCancelReason());
        response.setContactDisclosed(handover.getContactDisclosed());
        response.setCreatedAt(handover.getCreatedAt());
        response.setUpdatedAt(handover.getUpdatedAt());
        return response;
    }
}
