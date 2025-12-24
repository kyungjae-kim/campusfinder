package com.bit.docker.admin.dto.response;

import com.bit.docker.admin.model.Report;
import com.bit.docker.admin.model.ReportStatus;
import com.bit.docker.admin.model.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private ReportTargetType targetType;
    private Long targetId;
    private Long reporterId;
    private String reason;
    private ReportStatus status;
    private String adminNote;
    private Long processedBy;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    
    public static ReportResponse from(Report report) {
        return new ReportResponse(
            report.getId(),
            report.getTargetType(),
            report.getTargetId(),
            report.getReporterId(),
            report.getReason(),
            report.getStatus(),
            report.getAdminNote(),
            report.getProcessedBy(),
            report.getProcessedAt(),
            report.getCreatedAt()
        );
    }
}
