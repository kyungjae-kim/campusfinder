package com.bit.docker.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResolveRequest {
    private String adminNote;  // 관리자 처리 메모
    private Boolean shouldBlind;  // 블라인드 처리 여부
}
