package com.bit.docker.handover.service;

import com.bit.docker.handover.config.ServiceUrlProperties;
import com.bit.docker.handover.dto.FoundItemDTO;
import com.bit.docker.handover.dto.NotificationCreateRequest;
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
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HandoverService {
    private final HandoverRepository handoverRepository;
    private final RestTemplate restTemplate;
    private final ServiceUrlProperties serviceUrlProperties;

    // 보안 검수가 필요한 카테고리
    private static final List<String> SECURITY_CHECK_CATEGORIES = List.of("ELECTRONICS", "WALLET", "ID_CARD");
    
    // 인계 요청 생성 (E1. 분실자가 후보 습득물에 대해 인계 요청)
    @Transactional
    public HandoverResponse createHandover(Long requesterId, HandoverCreateRequest request) {
        // 중복 요청 체크
        handoverRepository.findByLostIdAndFoundId(request.getLostId(), request.getFoundId())
            .ifPresent(h -> {
                throw new IllegalArgumentException("이미 인계 요청이 존재합니다.");
            });
        
        // Found 서비스에서 습득물 정보 조회 (존재 여부 및 responderId)
        FoundItemDTO foundItem = getFoundItemById(request.getFoundId());
        if (foundItem == null) {
            throw new IllegalArgumentException("습득물을 찾을 수 없습니다.");
        }
        
        // Lost 서비스에서 분실 신고 존재 여부 확인
        try {
            String lostUrl = serviceUrlProperties.getLostService().getUrl() + "/api/lost/" + request.getLostId();
            restTemplate.getForEntity(lostUrl, Object.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("분실 신고를 찾을 수 없습니다.");
        }
        
        Handover handover = new Handover();
        handover.setLostId(request.getLostId());
        handover.setFoundId(request.getFoundId());
        handover.setRequesterId(requesterId);
        handover.setResponderId(foundItem.getOwnerUserId()); // Found 서비스에서 조회한 습득자 ID
        handover.setMethod(request.getMethod());
        handover.setScheduleAt(request.getScheduleAt());
        handover.setMeetPlace(request.getMeetPlace());
        handover.setStatus(HandoverStatus.REQUESTED);
        handover.setContactDisclosed(false);
        
        Handover saved = handoverRepository.save(handover);
        
        // Notification 서비스로 알림 전송 (습득자에게)
        sendNotification(
            foundItem.getOwnerUserId(),
            "HANDOVER_REQUESTED",
            "새로운 인계 요청",
            "분실 신고 #" + request.getLostId() + "에 대한 인계 요청이 도착했습니다.",
            saved.getId()
        );
        
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
        
        // Notification 서비스로 알림 전송 (분실자에게)
        sendNotification(
            handover.getRequesterId(),
            "HANDOVER_ACCEPTED",
            "인계 요청 승인됨",
            "인계 요청 #" + handoverId + "이 승인되었습니다.",
            handoverId
        );
        
        // 카테고리 확인 후 SECURITY 검수 필요 시 알림 전송
        FoundItemDTO foundItem = getFoundItemById(handover.getFoundId());
        if (foundItem != null && SECURITY_CHECK_CATEGORIES.contains(foundItem.getCategory())) {
            // SECURITY 역할을 가진 모든 사용자에게 알림 (User 서비스 호출 필요)
            sendSecurityCheckNotification(handoverId, foundItem.getCategory());
        }

        return HandoverResponse.from(handover);
    }

    // SECURITY에게 검수 필요 알림 전송
    private void sendSecurityCheckNotification(Long handoverId, String category) {
        try {
            // User 서비스에서 SECURITY 역할 사용자 목록 조회
            String url = serviceUrlProperties.getUserService().getUrl() + "/api/users/by-role/SECURITY";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> securityUsers = restTemplate.getForObject(url, List.class);

            if (securityUsers != null) {
                for (Map<String, Object> user : securityUsers) {
                    Long userId = ((Number) user.get("id")).longValue();
                    sendNotification(
                        userId,
                        "SECURITY_CHECK_REQUIRED",
                        "보안 검수 필요",
                        "인계 요청 #" + handoverId + " - " + category + " 카테고리 검수가 필요합니다.",
                        handoverId
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("SECURITY 알림 전송 실패: " + e.getMessage());
        }
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
        
        // Notification 서비스로 알림 전송 (분실자에게)
        sendNotification(
            handover.getRequesterId(),
            "HANDOVER_REJECTED",
            "인계 요청 거절됨",
            "인계 요청 #" + handoverId + "이 거절되었습니다. 사유: " + reason,
            handoverId
        );
        
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
        
        // Found 서비스에서 category 조회하여 검수 필요 여부 확인
        FoundItemDTO foundItem = getFoundItemById(handover.getFoundId());
        if (foundItem != null && !SECURITY_CHECK_CATEGORIES.contains(foundItem.getCategory())) {
            throw new IllegalArgumentException("이 카테고리는 보안 검수가 필요하지 않습니다.");
        }
        
        handover.setStatus(HandoverStatus.VERIFIED_BY_SECURITY);
        handover.setVerifiedBySecurityAt(LocalDateTime.now());
        
        // Notification 서비스로 알림 전송
        sendNotification(
            handover.getRequesterId(),
            "HANDOVER_VERIFIED",
            "보안 검수 완료",
            "인계 요청 #" + handoverId + "의 보안 검수가 완료되었습니다.",
            handoverId
        );
        sendNotification(
            handover.getResponderId(),
            "HANDOVER_VERIFIED",
            "보안 검수 완료",
            "인계 요청 #" + handoverId + "의 보안 검수가 완료되었습니다.",
            handoverId
        );
        
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
        
        // Notification 서비스로 알림 전송
        sendNotification(
            handover.getRequesterId(),
            "HANDOVER_APPROVED",
            "관리실 승인 완료",
            "인계 요청 #" + handoverId + "이 최종 승인되었습니다. 연락처가 공개되었습니다.",
            handoverId
        );
        sendNotification(
            handover.getResponderId(),
            "HANDOVER_APPROVED",
            "관리실 승인 완료",
            "인계 요청 #" + handoverId + "이 최종 승인되었습니다. 연락처가 공개되었습니다.",
            handoverId
        );
        
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
        
        // Notification 서비스로 알림 전송
        sendNotification(
            handover.getRequesterId(),
            "HANDOVER_SCHEDULED",
            "인계 일정 확정",
            "인계 일정이 확정되었습니다. " + scheduleAt + " / " + meetPlace,
            handoverId
        );
        sendNotification(
            handover.getResponderId(),
            "HANDOVER_SCHEDULED",
            "인계 일정 확정",
            "인계 일정이 확정되었습니다. " + scheduleAt + " / " + meetPlace,
            handoverId
        );
        
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
        
        // Lost 서비스 호출 - status를 CLOSED로 변경
        closeLostItem(handover.getLostId());
        
        // Found 서비스 호출 - status를 HANDED_OVER로 변경
        markFoundItemAsHandedOver(handover.getFoundId());
        
        // Notification 서비스로 알림 전송
        sendNotification(
            handover.getRequesterId(),
            "HANDOVER_COMPLETED",
            "인계 완료",
            "인계 요청 #" + handoverId + "이 완료되었습니다.",
            handoverId
        );
        sendNotification(
            handover.getResponderId(),
            "HANDOVER_COMPLETED",
            "인계 완료",
            "인계 요청 #" + handoverId + "이 완료되었습니다.",
            handoverId
        );
        
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
        
        // Notification 서비스로 알림 전송
        Long notifyUserId = handover.getRequesterId().equals(userId) 
            ? handover.getResponderId() 
            : handover.getRequesterId();
        
        sendNotification(
            notifyUserId,
            "HANDOVER_CANCELED",
            "인계 취소됨",
            "인계 요청 #" + handoverId + "이 취소되었습니다. 사유: " + reason,
            handoverId
        );
        
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
            .map(this::enrichHandoverResponse);
    }

    // 기간별 완료 통계 (Admin에서 호출)
    public long countCompletedByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return handoverRepository.findAll().stream()
                .filter(h -> h.getStatus() == HandoverStatus.COMPLETED)
                .count();
        }
        // LocalDate를 LocalDateTime으로 변환 (하루의 시작과 끝)
        java.time.LocalDateTime startDateTime = startDate.atStartOfDay();
        java.time.LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        return handoverRepository.countByStatusAndCompletedAtBetween(
            HandoverStatus.COMPLETED, startDateTime, endDateTime
        );
    }
    
    // ==================== 헬퍼 메서드 ====================
    
    // HandoverResponse에 외부 정보 추가
    @SuppressWarnings("unchecked")
    private HandoverResponse enrichHandoverResponse(Handover handover) {
        HandoverResponse response = HandoverResponse.from(handover);
        
        try {
            // Lost 정보 조회
            String lostUrl = serviceUrlProperties.getLostService().getUrl() + "/api/lost/" + handover.getLostId();
            Map<String, Object> lostItem = restTemplate.getForObject(lostUrl, Map.class);
            if (lostItem != null) {
                response.setLostTitle((String) lostItem.get("title"));
            }
        } catch (Exception e) {
            System.err.println("Lost 정보 조회 실패: " + e.getMessage());
            response.setLostTitle("분실물 #" + handover.getLostId());
        }
        
        try {
            // Found 정보 조회
            FoundItemDTO foundItem = getFoundItemById(handover.getFoundId());
            if (foundItem != null) {
                response.setFoundTitle(foundItem.getTitle());
            }
        } catch (Exception e) {
            System.err.println("Found 정보 조회 실패: " + e.getMessage());
            response.setFoundTitle("습득물 #" + handover.getFoundId());
        }
        
        try {
            // User 정보 조회
            String userUrl = serviceUrlProperties.getUserService().getUrl() + "/api/users/" + handover.getRequesterId();
            Map<String, Object> requester = restTemplate.getForObject(userUrl, Map.class);
            if (requester != null) {
                response.setRequesterName((String) requester.get("nickname"));
            }
        } catch (Exception e) {
            System.err.println("Requester 정보 조회 실패: " + e.getMessage());
            response.setRequesterName("사용자 #" + handover.getRequesterId());
        }
        
        try {
            // User 정보 조회
            String userUrl = serviceUrlProperties.getUserService().getUrl() + "/api/users/" + handover.getResponderId();
            Map<String, Object> responder = restTemplate.getForObject(userUrl, Map.class);
            if (responder != null) {
                response.setResponderName((String) responder.get("nickname"));
            }
        } catch (Exception e) {
            System.err.println("Responder 정보 조회 실패: " + e.getMessage());
            response.setResponderName("사용자 #" + handover.getResponderId());
        }
        
        return response;
    }
    
    // Found 서비스에서 습득물 조회
    private FoundItemDTO getFoundItemById(Long foundId) {
        try {
            String url = serviceUrlProperties.getFoundService().getUrl() + "/api/found/" + foundId;
            return restTemplate.getForObject(url, FoundItemDTO.class);
        } catch (Exception e) {
            System.err.println("Found 서비스 호출 실패: " + e.getMessage());
            return null;
        }
    }
    
    // Lost 서비스 상태 업데이트 (인계 완료 시 CLOSED로 변경)
    private void closeLostItem(Long lostId) {
        try {
            String url = serviceUrlProperties.getLostService().getUrl() + "/api/lost/" + lostId + "/status";
            Map<String, String> request = new HashMap<>();
            request.put("status", "CLOSED");
            restTemplate.put(url, request);
        } catch (Exception e) {
            System.err.println("Lost 서비스 상태 업데이트 실패: " + e.getMessage());
        }
    }
    
    // Found 서비스 상태 업데이트 (인계 완료 시 HANDED_OVER로 변경)
    private void markFoundItemAsHandedOver(Long foundId) {
        try {
            String url = serviceUrlProperties.getFoundService().getUrl() + "/api/found/" + foundId + "/status";
            Map<String, String> request = new HashMap<>();
            request.put("status", "HANDED_OVER");
            restTemplate.put(url, request);
        } catch (Exception e) {
            System.err.println("Found 서비스 상태 업데이트 실패: " + e.getMessage());
        }
    }
    
    // Notification 서비스로 알림 전송
    private void sendNotification(Long userId, String type, String title, String message, Long relatedId) {
        try {
            String url = serviceUrlProperties.getNotificationService().getUrl() + "/api/notifications";
            NotificationCreateRequest request = new NotificationCreateRequest(
                userId, type, title, message, relatedId
            );
            restTemplate.postForObject(url, request, Object.class);
        } catch (Exception e) {
            System.err.println("Notification 서비스 호출 실패: " + e.getMessage());
            // 알림 전송 실패는 메인 비즈니스 로직에 영향을 주지 않도록 로그만 남김
        }
    }
}
