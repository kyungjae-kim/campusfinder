package com.bit.docker.handover.repository;

import com.bit.docker.handover.model.Handover;
import com.bit.docker.handover.model.HandoverStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HandoverRepository extends JpaRepository<Handover, Long> {
    // 분실 신고별 인계 조회
    List<Handover> findByLostId(Long lostId);
    
    // 습득물별 인계 조회
    List<Handover> findByFoundId(Long foundId);
    
    // 요청자(분실자)별 조회
    List<Handover> findByRequesterId(Long requesterId);
    Page<Handover> findByRequesterId(Long requesterId, Pageable pageable);
    
    // 응답자(습득자)별 조회
    List<Handover> findByResponderId(Long responderId);
    Page<Handover> findByResponderId(Long responderId, Pageable pageable);
    
    // 상태별 조회
    Page<Handover> findByStatus(HandoverStatus status, Pageable pageable);
    
    // 분실 신고 + 습득물 조합으로 조회
    Optional<Handover> findByLostIdAndFoundId(Long lostId, Long foundId);

    // 기간별 상태별 통계 (Admin에서 호출)
    long countByStatusAndCompletedAtBetween(
        HandoverStatus status,
        java.time.LocalDateTime startDate,
        java.time.LocalDateTime endDate
    );
}
