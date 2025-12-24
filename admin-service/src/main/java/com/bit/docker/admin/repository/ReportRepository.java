package com.bit.docker.admin.repository;

import com.bit.docker.admin.model.Report;
import com.bit.docker.admin.model.ReportStatus;
import com.bit.docker.admin.model.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {
    // 상태별 신고 조회
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    
    // 타입별 신고 조회
    Page<Report> findByTargetType(ReportTargetType targetType, Pageable pageable);
    
    // 대상별 신고 조회
    List<Report> findByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);
    
    // 특정 사용자가 신고한 내역
    Page<Report> findByReporterId(Long reporterId, Pageable pageable);
    
    // 중복 신고 확인
    Optional<Report> findByReporterIdAndTargetTypeAndTargetId(
        Long reporterId, ReportTargetType targetType, Long targetId
    );
}
