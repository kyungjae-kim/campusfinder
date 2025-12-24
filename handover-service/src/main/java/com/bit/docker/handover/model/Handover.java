package com.bit.docker.handover.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "handovers")
@Data
@NoArgsConstructor
public class Handover {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lostId;  // 분실 신고 ID

    @Column(nullable = false)
    private Long foundId;  // 습득물 ID

    @Column(nullable = false)
    private Long requesterId;  // 분실자 ID

    @Column(nullable = false)
    private Long responderId;  // 습득자 ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HandoverMethod method;  // 인계 방법

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HandoverStatus status = HandoverStatus.REQUESTED;

    // 일정 정보
    private LocalDateTime scheduleAt;  // 인계 예정 시각

    @Column(length = 200)
    private String meetPlace;  // 만남 장소 (MEET 방식일 때)

    // 승인 타임스탬프들
    private LocalDateTime acceptedByFinderAt;  // 습득자 승인 시각
    private LocalDateTime verifiedBySecurityAt;  // 보안 검수 시각
    private LocalDateTime approvedByOfficeAt;  // 관리실 승인 시각
    private LocalDateTime completedAt;  // 인계 완료 시각
    private LocalDateTime canceledAt;  // 취소 시각

    @Column(length = 500)
    private String cancelReason;  // 취소/거절 사유

    @Column(nullable = false)
    private Boolean contactDisclosed = false;  // 연락처 공개 여부

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}