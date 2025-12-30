package com.bit.docker.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    // H4. 운영 통계 (최소 3개 지표)
    private Long lostCount;       // 기간별 분실 신고 수
    private Long foundCount;      // 기간별 습득물 등록 수
    private Long handoverCount;   // 인계 완료 수
}
