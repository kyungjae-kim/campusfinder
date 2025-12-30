package com.bit.docker.lost.controller;

import com.bit.docker.lost.dto.request.LostItemCreateRequest;
import com.bit.docker.lost.dto.request.LostItemUpdateRequest;
import com.bit.docker.lost.dto.response.LostItemResponse;
import com.bit.docker.lost.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lost")
@RequiredArgsConstructor
public class LostItemController {
    private final LostItemService lostItemService;
    
    // 분실 신고 등록
    @PostMapping
    public ResponseEntity<LostItemResponse> createLostItem(
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Status") String userStatus,
        @RequestBody LostItemCreateRequest request
    ) {
        // 정지된 사용자는 글 등록 불가 (A3)
        if ("BLOCKED".equals(userStatus)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        
        LostItemResponse response = lostItemService.createLostItem(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 분실 신고 목록 (전체)
    @GetMapping
    public ResponseEntity<Page<LostItemResponse>> getAllLostItems(Pageable pageable) {
        Page<LostItemResponse> response = lostItemService.getAllLostItems(pageable);
        return ResponseEntity.ok(response);
    }
    
    // 내 분실 신고 목록
    @GetMapping("/my")
    public ResponseEntity<List<LostItemResponse>> getMyLostItems(
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<LostItemResponse> response = lostItemService.getMyLostItems(userId);
        return ResponseEntity.ok(response);
    }
    
    // 분실 신고 상세
    @GetMapping("/{id}")
    public ResponseEntity<LostItemResponse> getLostItem(@PathVariable Long id) {
        LostItemResponse response = lostItemService.getLostItem(id);
        return ResponseEntity.ok(response);
    }
    
    // 분실 신고 수정
    @PutMapping("/{id}")
    public ResponseEntity<LostItemResponse> updateLostItem(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Status") String userStatus,
        @RequestBody LostItemUpdateRequest request
    ) {
        // 정지된 사용자는 수정 불가 (A3)
        if ("BLOCKED".equals(userStatus)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        
        // ADMIN은 모든 글 수정 가능, 일반 사용자는 본인 글만 수정 가능
        LostItemResponse response = lostItemService.updateLostItem(id, userId, role, request);
        return ResponseEntity.ok(response);
    }
    
    // 분실 신고 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLostItem(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Status") String userStatus
    ) {
        // 정지된 사용자는 삭제 불가 (A3)
        if ("BLOCKED".equals(userStatus)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // ADMIN은 모든 글 삭제 가능, 일반 사용자는 본인 글만 삭제 가능
        lostItemService.deleteLostItem(id, userId, role);
        return ResponseEntity.noContent().build();
    }
    
    // 상태 업데이트 (Handover에서 호출)
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
        @PathVariable Long id,
        @RequestBody java.util.Map<String, String> request
    ) {
        String status = request.get("status");
        com.bit.docker.lost.model.LostStatus lostStatus = com.bit.docker.lost.model.LostStatus.valueOf(status);
        lostItemService.updateStatus(id, lostStatus);
        return ResponseEntity.ok().build();
    }
    
    // 통계 (Admin에서 호출)
    @GetMapping("/count")
    public ResponseEntity<java.util.Map<String, Long>> getCount(
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate
    ) {
        long count = lostItemService.countByDateRange(startDate, endDate);
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }
}
