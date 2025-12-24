package com.bit.docker.handover.controller;

import com.bit.docker.handover.dto.request.HandoverCreateRequest;
import com.bit.docker.handover.dto.response.HandoverResponse;
import com.bit.docker.handover.service.HandoverService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/handovers")
@RequiredArgsConstructor
public class HandoverController {
    private final HandoverService handoverService;
    
    // 인계 요청 생성 (분실자)
    @PostMapping
    public ResponseEntity<HandoverResponse> createHandover(
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody HandoverCreateRequest request
    ) {
        HandoverResponse response = handoverService.createHandover(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 인계 요청 승인 (습득자)
    @PostMapping("/{handoverId}/accept")
    public ResponseEntity<HandoverResponse> acceptHandover(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        HandoverResponse response = handoverService.acceptByFinder(handoverId, userId);
        return ResponseEntity.ok(response);
    }
    
    // 인계 요청 거절 (습득자)
    @PostMapping("/{handoverId}/reject")
    public ResponseEntity<HandoverResponse> rejectHandover(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody Map<String, String> request
    ) {
        String reason = request.get("reason");
        HandoverResponse response = handoverService.rejectByFinder(handoverId, userId, reason);
        return ResponseEntity.ok(response);
    }
    
    // 보안 검수 (SECURITY)
    @PostMapping("/{handoverId}/verify")
    public ResponseEntity<HandoverResponse> verifyBySecurity(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 SECURITY인지 확인
        HandoverResponse response = handoverService.verifyBySecurity(handoverId);
        return ResponseEntity.ok(response);
    }
    
    // 관리실 승인 (OFFICE)
    @PostMapping("/{handoverId}/approve")
    public ResponseEntity<HandoverResponse> approveByOffice(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 OFFICE인지 확인
        HandoverResponse response = handoverService.approveByOffice(handoverId);
        return ResponseEntity.ok(response);
    }
    
    // 일정 확정
    @PostMapping("/{handoverId}/schedule")
    public ResponseEntity<HandoverResponse> scheduleHandover(
        @PathVariable Long handoverId,
        @RequestBody Map<String, String> request
    ) {
        LocalDateTime scheduleAt = LocalDateTime.parse(request.get("scheduleAt"));
        String meetPlace = request.get("meetPlace");
        HandoverResponse response = handoverService.scheduleHandover(handoverId, scheduleAt, meetPlace);
        return ResponseEntity.ok(response);
    }
    
    // 인계 완료
    @PostMapping("/{handoverId}/complete")
    public ResponseEntity<HandoverResponse> completeHandover(
        @PathVariable Long handoverId
    ) {
        HandoverResponse response = handoverService.completeHandover(handoverId);
        return ResponseEntity.ok(response);
    }
    
    // 인계 취소
    @PostMapping("/{handoverId}/cancel")
    public ResponseEntity<HandoverResponse> cancelHandover(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody Map<String, String> request
    ) {
        String reason = request.get("reason");
        HandoverResponse response = handoverService.cancelHandover(handoverId, userId, reason);
        return ResponseEntity.ok(response);
    }
    
    // 인계 상세 조회
    @GetMapping("/{handoverId}")
    public ResponseEntity<HandoverResponse> getHandover(@PathVariable Long handoverId) {
        HandoverResponse response = handoverService.getHandover(handoverId);
        return ResponseEntity.ok(response);
    }
    
    // 내 인계 요청 목록 (분실자)
    @GetMapping("/my-requests")
    public ResponseEntity<List<HandoverResponse>> getMyRequests(
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<HandoverResponse> response = handoverService.getMyRequests(userId);
        return ResponseEntity.ok(response);
    }
    
    // 내 인계 수신함 (습득자)
    @GetMapping("/my-responses")
    public ResponseEntity<List<HandoverResponse>> getMyResponses(
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<HandoverResponse> response = handoverService.getMyResponses(userId);
        return ResponseEntity.ok(response);
    }
    
    // 전체 목록 (관리자/OFFICE용)
    @GetMapping
    public ResponseEntity<Page<HandoverResponse>> getAllHandovers(Pageable pageable) {
        Page<HandoverResponse> response = handoverService.getAllHandovers(pageable);
        return ResponseEntity.ok(response);
    }

    // 통계 (Admin에서 호출)
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount(
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        long count = handoverService.countCompletedByDateRange(startDate, endDate);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
