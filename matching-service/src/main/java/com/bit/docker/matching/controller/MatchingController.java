package com.bit.docker.matching.controller;

import com.bit.docker.matching.dto.response.MatchingResponse;
import com.bit.docker.matching.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {
    private final MatchingService matchingService;
    
    /**
     * 분실 신고에 대한 매칭 후보 조회
     * GET /api/matching/lost/{lostId}?topN=10
     */
    @GetMapping("/lost/{lostId}")
    public ResponseEntity<List<MatchingResponse>> getMatchingCandidatesForLost(
        @PathVariable Long lostId,
        @RequestParam(defaultValue = "10") int topN
    ) {
        List<MatchingResponse> candidates = matchingService.findMatchingCandidatesForLost(lostId, topN);
        return ResponseEntity.ok(candidates);
    }
    
    /**
     * 습득물에 대한 매칭 후보 조회
     * GET /api/matching/found/{foundId}?topN=10
     */
    @GetMapping("/found/{foundId}")
    public ResponseEntity<List<MatchingResponse>> getMatchingCandidatesForFound(
        @PathVariable Long foundId,
        @RequestParam(defaultValue = "10") int topN
    ) {
        List<MatchingResponse> candidates = matchingService.findMatchingCandidatesForFound(foundId, topN);
        return ResponseEntity.ok(candidates);
    }
}
