package com.bit.docker.handover.service;

import com.bit.docker.handover.dto.request.HandoverCreateRequest;
import com.bit.docker.handover.dto.response.HandoverResponse;
import com.bit.docker.handover.model.Handover;
import com.bit.docker.handover.model.HandoverStatus;
import com.bit.docker.handover.repository.HandoverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HandoverService {
    private final HandoverRepository handoverRepository;
    // TODO: RestTemplate 또는 FeignClient로 Lost, Found 서비스 호출
    
    // 인계 요청 생성 (E1. 분실자가 후보 습득물에 대해 인계 요청)
    @Transactional
    public HandoverResponse createHandover(Long requesterId, HandoverCreateRequest request) {
        // 중복 요청 체크
        handoverRepository.findByLostIdAndFoundId(request.getLostId(), request.getFoundId())
            .ifPresent(h -> {
                throw new IllegalArgumentException("이미 인계 요청이 존재합니다.");
            });
        
        // TODO: Lost, Found 서비스에서 실제 존재 여부 확인
        // TODO: Found 서비스에서 responderId(습득자) 조회
        
        Handover handover = new Handover();
        handover.setLostId(request.getLostId());
        handover.setFoundId(request.getFoundId());
        handover.setRequesterId(requesterId);
        // handover.setResponderId(responderId); // TODO: Found 서비스에서 조회
        handover.setMethod(request.getMethod());
        handover.setScheduleAt(request.getScheduleAt());
        handover.setMeetPlace(request.getMeetPlace());
        handover.setStatus(HandoverStatus.REQUESTED);
        handover.setContactDisclosed(false);
        
        Handover saved = handoverRepository.save(handover);
        
        // TODO: Notification 서비스로 알림 전송 (습득자에게)
        
        return HandoverResponse.from(saved);
    }
    
    // 인계 요청 승인 (E2. 습득자가 요청을 승인)
    @Transactional
    public HandoverResponse acceptByFinder(Long handoverId, Long responderId) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 권한 확인
        if (!handover.getResponderId().equals(responderId)) {
            throw new IllegalArgumentException("승인 권한이 없습니다.");
        }
        
        // 상태 확인
        if (handover.getStatus() != HandoverStatus.REQUESTED) {
            throw new IllegalArgumentException("승인할 수 없는 상태입니다.");
        }
        
        handover.setStatus(HandoverStatus.ACCEPTED_BY_FINDER);
        handover.setAcceptedByFinderAt(LocalDateTime.now());
        
        // TODO: Notification 서비스로 알림 전송 (분실자에게)
        
        return HandoverResponse.from(handover);
    }
    
    // 인계 요청 거절
    @Transactional
    public HandoverResponse rejectByFinder(Long handoverId, Long responderId, String reason) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 권한 확인
        if (!handover.getResponderId().equals(responderId)) {
            throw new IllegalArgumentException("거절 권한이 없습니다.");
        }
        
        // 상태 확인
        if (handover.getStatus() != HandoverStatus.REQUESTED) {
            throw new IllegalArgumentException("거절할 수 없는 상태입니다.");
        }
        
        handover.setStatus(HandoverStatus.REJECTED);
        handover.setCanceledAt(LocalDateTime.now());
        handover.setCancelReason(reason);
        
        // TODO: Notification 서비스로 알림 전송 (분실자에게)
        
        return HandoverResponse.from(handover);
    }
    
    // 보안 검수 (E4. SECURITY가 고가품/위험물 확인)
    @Transactional
    public HandoverResponse verifyBySecurity(Long handoverId) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 상태 확인
        if (handover.getStatus() != HandoverStatus.ACCEPTED_BY_FINDER) {
            throw new IllegalArgumentException("검수할 수 없는 상태입니다.");
        }
        
        // TODO: Found 서비스에서 category 조회하여 검수 필요 여부 확인
        
        handover.setStatus(HandoverStatus.VERIFIED_BY_SECURITY);
        handover.setVerifiedBySecurityAt(LocalDateTime.now());
        
        // TODO: Notification 서비스로 알림 전송
        
        return HandoverResponse.from(handover);
    }
    
    // 관리실 승인 (E4. OFFICE가 최종 승인)
    @Transactional
    public HandoverResponse approveByOffice(Long handoverId) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 상태 확인 (SECURITY 검수를 거쳤거나, 습득자 승인 상태)
        if (handover.getStatus() != HandoverStatus.VERIFIED_BY_SECURITY 
            && handover.getStatus() != HandoverStatus.ACCEPTED_BY_FINDER) {
            throw new IllegalArgumentException("승인할 수 없는 상태입니다.");
        }
        
        handover.setStatus(HandoverStatus.APPROVED_BY_OFFICE);
        handover.setApprovedByOfficeAt(LocalDateTime.now());
        
        // 📌 연락처 공개 (2-1. 권한 규칙)
        handover.setContactDisclosed(true);
        
        // TODO: Notification 서비스로 알림 전송
        
        return HandoverResponse.from(handover);
    }
    
    // 일정 확정
    @Transactional
    public HandoverResponse scheduleHandover(Long handoverId, LocalDateTime scheduleAt, String meetPlace) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 상태 확인
        if (handover.getStatus() != HandoverStatus.APPROVED_BY_OFFICE) {
            throw new IllegalArgumentException("일정을 확정할 수 없는 상태입니다.");
        }
        
        handover.setScheduleAt(scheduleAt);
        handover.setMeetPlace(meetPlace);
        handover.setStatus(HandoverStatus.SCHEDULED);
        
        // TODO: Notification 서비스로 알림 전송
        
        return HandoverResponse.from(handover);
    }
    
    // 인계 완료 (E5. 테스트 시나리오 8번 - 상태 동기화)
    @Transactional
    public HandoverResponse completeHandover(Long handoverId) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 상태 확인
        if (handover.getStatus() != HandoverStatus.SCHEDULED) {
            throw new IllegalArgumentException("완료 처리할 수 없는 상태입니다.");
        }
        
        handover.setStatus(HandoverStatus.COMPLETED);
        handover.setCompletedAt(LocalDateTime.now());
        
        // TODO: Lost 서비스 호출 - status를 CLOSED로 변경
        // TODO: Found 서비스 호출 - status를 HANDED_OVER로 변경
        // TODO: Notification 서비스로 알림 전송
        
        return HandoverResponse.from(handover);
    }
    
    // 인계 취소
    @Transactional
    public HandoverResponse cancelHandover(Long handoverId, Long userId, String reason) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        
        // 권한 확인 (요청자 또는 응답자만)
        if (!handover.getRequesterId().equals(userId) && !handover.getResponderId().equals(userId)) {
            throw new IllegalArgumentException("취소 권한이 없습니다.");
        }
        
        // 완료/취소된 건은 취소 불가
        if (handover.getStatus() == HandoverStatus.COMPLETED 
            || handover.getStatus() == HandoverStatus.CANCELED
            || handover.getStatus() == HandoverStatus.REJECTED) {
            throw new IllegalArgumentException("취소할 수 없는 상태입니다.");
        }
        
        handover.setStatus(HandoverStatus.CANCELED);
        handover.setCanceledAt(LocalDateTime.now());
        handover.setCancelReason(reason);
        
        // TODO: Notification 서비스로 알림 전송
        
        return HandoverResponse.from(handover);
    }
    
    // 인계 상세 조회
    public HandoverResponse getHandover(Long handoverId) {
        Handover handover = handoverRepository.findById(handoverId)
            .orElseThrow(() -> new IllegalArgumentException("인계 요청을 찾을 수 없습니다."));
        return HandoverResponse.from(handover);
    }
    
    // 내 인계 요청 목록 (분실자 입장)
    public List<HandoverResponse> getMyRequests(Long requesterId) {
        return handoverRepository.findByRequesterId(requesterId).stream()
            .map(HandoverResponse::from)
            .collect(Collectors.toList());
    }
    
    // 내 인계 수신함 (습득자 입장)
    public List<HandoverResponse> getMyResponses(Long responderId) {
        return handoverRepository.findByResponderId(responderId).stream()
            .map(HandoverResponse::from)
            .collect(Collectors.toList());
    }
    
    // 전체 목록 (관리자/OFFICE용)
    public Page<HandoverResponse> getAllHandovers(Pageable pageable) {
        return handoverRepository.findAll(pageable)
            .map(HandoverResponse::from);
    }

    // 기간별 완료 통계 (Admin에서 호출)
    public long countCompletedByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            return handoverRepository.findAll().stream()
                .filter(h -> h.getStatus() == HandoverStatus.COMPLETED)
                .count();
        }
        return handoverRepository.countByStatusAndCompletedAtBetween(
            HandoverStatus.COMPLETED, startDate, endDate
        );
    }
}
