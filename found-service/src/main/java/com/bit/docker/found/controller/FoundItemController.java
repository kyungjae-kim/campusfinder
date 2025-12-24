package com.bit.docker.found.controller;

import com.bit.docker.found.dto.request.FoundItemCreateRequest;
import com.bit.docker.found.dto.request.FoundItemUpdateRequest;
import com.bit.docker.found.dto.response.FoundItemResponse;
import com.bit.docker.found.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/found")
@RequiredArgsConstructor
public class FoundItemController {
    private final FoundItemService foundItemService;
    
    // 습득물 등록
    @PostMapping
    public ResponseEntity<FoundItemResponse> createFoundItem(
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody FoundItemCreateRequest request
    ) {
        FoundItemResponse response = foundItemService.createFoundItem(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 습득물 목록 (전체)
    @GetMapping
    public ResponseEntity<Page<FoundItemResponse>> getAllFoundItems(Pageable pageable) {
        Page<FoundItemResponse> response = foundItemService.getAllFoundItems(pageable);
        return ResponseEntity.ok(response);
    }
    
    // 내 습득물 목록
    @GetMapping("/my")
    public ResponseEntity<List<FoundItemResponse>> getMyFoundItems(
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<FoundItemResponse> response = foundItemService.getMyFoundItems(userId);
        return ResponseEntity.ok(response);
    }
    
    // 습득물 상세
    @GetMapping("/{id}")
    public ResponseEntity<FoundItemResponse> getFoundItem(@PathVariable Long id) {
        FoundItemResponse response = foundItemService.getFoundItem(id);
        return ResponseEntity.ok(response);
    }
    
    // 습득물 수정
    @PutMapping("/{id}")
    public ResponseEntity<FoundItemResponse> updateFoundItem(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody FoundItemUpdateRequest request
    ) {
        FoundItemResponse response = foundItemService.updateFoundItem(id, userId, request);
        return ResponseEntity.ok(response);
    }
    
    // 습득물 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoundItem(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        foundItemService.deleteFoundItem(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    // 보관 처리 (OFFICE용)
    @PostMapping("/{id}/storage")
    public ResponseEntity<FoundItemResponse> updateStorage(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        String storageLocation = request.get("storageLocation");
        FoundItemResponse response = foundItemService.updateStorage(id, storageLocation);
        return ResponseEntity.ok(response);
    }

    // 상태 업데이트 (Handover에서 호출)
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        com.bit.docker.found.model.FoundStatus foundStatus = com.bit.docker.found.model.FoundStatus.valueOf(status);
        foundItemService.updateStatus(id, foundStatus);
        return ResponseEntity.ok().build();
    }

    // 통계 (Admin에서 호출)
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount(
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate
    ) {
        long count = foundItemService.countByDateRange(startDate, endDate);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
