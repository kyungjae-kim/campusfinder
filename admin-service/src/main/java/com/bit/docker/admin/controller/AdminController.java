package com.bit.docker.admin.controller;

import com.bit.docker.admin.dto.request.ReportCreateRequest;
import com.bit.docker.admin.dto.request.ReportResolveRequest;
import com.bit.docker.admin.dto.response.ReportResponse;
import com.bit.docker.admin.dto.response.StatisticsResponse;
import com.bit.docker.admin.model.ReportStatus;
import com.bit.docker.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    
    // ========== 신고 관리 ==========
    
    // 신고 등록 (일반 사용자)
    @PostMapping("/reports")
    public ResponseEntity<ReportResponse> createReport(
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody ReportCreateRequest request
    ) {
        ReportResponse response = adminService.createReport(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 신고 목록 조회 (관리자)
    @GetMapping("/reports")
    public ResponseEntity<Page<ReportResponse>> getReports(
        @RequestParam(required = false) ReportStatus status,
        Pageable pageable,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN인지 확인
        Page<ReportResponse> response = adminService.getReports(status, pageable);
        return ResponseEntity.ok(response);
    }
    
    // 신고 상세 조회 (관리자)
    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ReportResponse> getReport(
        @PathVariable Long reportId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN인지 확인
        ReportResponse response = adminService.getReport(reportId);
        return ResponseEntity.ok(response);
    }
    
    // 신고 처리 (관리자)
    @PutMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
        @PathVariable Long reportId,
        @RequestHeader("X-User-Id") Long adminId,
        @RequestHeader("X-User-Role") String role,
        @RequestBody ReportResolveRequest request
    ) {
        // TODO: role이 ADMIN인지 확인
        ReportResponse response = adminService.resolveReport(reportId, adminId, request);
        return ResponseEntity.ok(response);
    }
    
    // ========== 블라인드 처리 ==========
    
    // 게시물/메시지 블라인드
    @PostMapping("/items/{targetType}/{targetId}/blind")
    public ResponseEntity<Void> blindItem(
        @PathVariable String targetType,
        @PathVariable Long targetId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN, OFFICE, SECURITY인지 확인
        adminService.blindItem(targetType, targetId);
        return ResponseEntity.ok().build();
    }
    
    // 블라인드 해제
    @PostMapping("/items/{targetType}/{targetId}/unblind")
    public ResponseEntity<Void> unblindItem(
        @PathVariable String targetType,
        @PathVariable Long targetId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN인지 확인
        adminService.unblindItem(targetType, targetId);
        return ResponseEntity.ok().build();
    }
    
    // ========== 사용자 제재 ==========
    
    // 사용자 정지
    @PostMapping("/users/{userId}/block")
    public ResponseEntity<Void> blockUser(
        @PathVariable Long userId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN인지 확인
        adminService.blockUser(userId);
        return ResponseEntity.ok().build();
    }
    
    // 사용자 정지 해제
    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(
        @PathVariable Long userId,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN인지 확인
        adminService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }
    
    // ========== 운영 통계 ==========
    
    // 운영 통계 조회
    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> getStatistics(
        @RequestParam(required = false) 
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime startDate,
        @RequestParam(required = false) 
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime endDate,
        @RequestHeader("X-User-Role") String role
    ) {
        // TODO: role이 ADMIN인지 확인
        StatisticsResponse response = adminService.getStatistics(startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
