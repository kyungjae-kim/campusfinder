package com.bit.docker.admin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportTargetType targetType;  // 신고 대상 타입

    @Column(nullable = false)
    private Long targetId;  // 신고 대상 ID

    @Column(nullable = false)
    private Long reporterId;  // 신고자 ID

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;  // 신고 사유

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.OPEN;

    @Column(length = 500)
    private String adminNote;  // 관리자 메모

    private Long processedBy;  // 처리한 관리자 ID
    private LocalDateTime processedAt;  // 처리 시각

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}