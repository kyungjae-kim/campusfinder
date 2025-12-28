package com.bit.docker.admin.service;

import com.bit.docker.admin.client.FoundServiceClient;
import com.bit.docker.admin.client.HandoverServiceClient;
import com.bit.docker.admin.client.LostServiceClient;
import com.bit.docker.admin.client.UserServiceClient;
import com.bit.docker.admin.dto.request.ReportCreateRequest;
import com.bit.docker.admin.dto.request.ReportResolveRequest;
import com.bit.docker.admin.dto.response.ReportResponse;
import com.bit.docker.admin.dto.response.StatisticsResponse;
import com.bit.docker.admin.model.Report;
import com.bit.docker.admin.model.ReportStatus;
import com.bit.docker.admin.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final ReportRepository reportRepository;
    private final LostServiceClient lostServiceClient;
    private final FoundServiceClient foundServiceClient;
    private final UserServiceClient userServiceClient;
    private final HandoverServiceClient handoverServiceClient;

    // ========== 신고 관리 ==========

    // 신고 등록 (H1. 사용자는 게시물/메시지를 신고할 수 있다)
    @Transactional
    public ReportResponse createReport(Long reporterId, ReportCreateRequest request) {
        // 중복 신고 확인
        reportRepository.findByReporterIdAndTargetTypeAndTargetId(
            reporterId, request.getTargetType(), request.getTargetId()
        ).ifPresent(r -> {
            throw new IllegalArgumentException("이미 신고한 항목입니다.");
        });

        // 대상이 실제로 존재하는지 확인 (선택적 - 현재는 생략)

        Report report = new Report();
        report.setTargetType(request.getTargetType());
        report.setTargetId(request.getTargetId());
        report.setReporterId(reporterId);
        report.setReason(request.getReason());
        report.setStatus(ReportStatus.OPEN);

        Report saved = reportRepository.save(report);
        return ReportResponse.from(saved);
    }

    // 신고 목록 조회 (관리자용)
    public Page<ReportResponse> getReports(ReportStatus status, Pageable pageable) {
        if (status != null) {
            return reportRepository.findByStatus(status, pageable)
                .map(ReportResponse::from);
        }
        return reportRepository.findAll(pageable)
            .map(ReportResponse::from);
    }

    // 신고 상세 조회
    public ReportResponse getReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));
        return ReportResponse.from(report);
    }

    // 신고 처리 (H2. ADMIN은 신고를 처리하고, 대상 글/메시지를 블라인드할 수 있다)
    @Transactional
    public ReportResponse resolveReport(Long reportId, Long adminId, ReportResolveRequest request) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));

        if (report.getStatus() == ReportStatus.RESOLVED) {
            throw new IllegalArgumentException("이미 처리된 신고입니다.");
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setAdminNote(request.getAdminNote());
        report.setProcessedBy(adminId);
        report.setProcessedAt(LocalDateTime.now());

        // 블라인드 처리
        if (request.getShouldBlind() != null && request.getShouldBlind()) {
            blindItem(report.getTargetType().name(), report.getTargetId());
        }

        return ReportResponse.from(report);
    }

    // ========== 블라인드 처리 ==========

    // 게시물/메시지 블라인드
    @Transactional
    public void blindItem(String targetType, Long targetId) {
        // Lost, Found, Message 서비스의 블라인드 API 호출
        // 현재는 구현하지 않고 로그만 출력
        System.out.println("블라인드 처리: " + targetType + " ID=" + targetId);
    }

    // 블라인드 해제
    @Transactional
    public void unblindItem(String targetType, Long targetId) {
        // Lost, Found, Message 서비스의 블라인드 해제 API 호출
        // 현재는 구현하지 않고 로그만 출력
        System.out.println("블라인드 해제: " + targetType + " ID=" + targetId);
    }

    // ========== 사용자 제재 ==========

    // 사용자 정지 (H3. ADMIN은 사용자 정지/해제를 할 수 있다)
    @Transactional
    public void blockUser(Long userId) {
        userServiceClient.blockUser(userId);
    }

    // 사용자 정지 해제
    @Transactional
    public void unblockUser(Long userId) {
        userServiceClient.unblockUser(userId);
    }

    // ========== 운영 통계 ==========

    // 운영 통계 조회 (H4. 최소 3개 지표)
    public StatisticsResponse getStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        StatisticsResponse stats = new StatisticsResponse();

        // Lost 서비스 호출 - 기간별 분실 신고 수
        stats.setLostItemCount(lostServiceClient.countByDateRange(startDate, endDate));

        // Found 서비스 호출 - 기간별 습득물 등록 수
        stats.setFoundItemCount(foundServiceClient.countByDateRange(startDate, endDate));

        // Handover 서비스 호출 - 인계 완료 수
        stats.setHandoverCompletedCount(handoverServiceClient.countCompleted(startDate, endDate));

        // 사용자 통계는 간단히 0으로 설정 (User 서비스에 통계 API 추가 필요)
        stats.setTotalUserCount(0L);
        stats.setActiveUserCount(0L);
        
        // 신고 수 (자체 DB)
        stats.setReportCount((long) reportRepository.findAll().size());
        
        return stats;
    }
}
