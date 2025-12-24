package com.bit.docker.matching.dto.response;

import com.bit.docker.matching.dto.FoundItemDTO;
import com.bit.docker.matching.dto.LostItemDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchingResponse {
    private Long lostId;
    private Long foundId;
    private Integer score;
    private String reason;
    private LostItemDTO lostItem;    // 분실 신고 정보
    private FoundItemDTO foundItem;  // 습득물 정보
}
