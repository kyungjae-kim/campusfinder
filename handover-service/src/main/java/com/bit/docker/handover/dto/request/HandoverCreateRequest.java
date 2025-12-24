package com.bit.docker.handover.dto.request;

import com.bit.docker.handover.model.HandoverMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HandoverCreateRequest {
    private Long lostId;        // 분실 신고 ID
    private Long foundId;       // 습득물 ID
    private HandoverMethod method;  // 인계 방법
    private LocalDateTime scheduleAt;  // 인계 예정 시각 (옵션)
    private String meetPlace;   // 만남 장소 (MEET일 때)
}
