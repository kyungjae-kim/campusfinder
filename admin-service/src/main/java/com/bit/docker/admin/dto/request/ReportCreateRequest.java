package com.bit.docker.admin.dto.request;

import com.bit.docker.admin.model.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportCreateRequest {
    private ReportTargetType targetType;  // LOST, FOUND, MESSAGE
    private Long targetId;
    private String reason;
}
