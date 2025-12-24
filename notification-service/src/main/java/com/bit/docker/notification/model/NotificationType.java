package com.bit.docker.notification.model;

public enum NotificationType {
    // G1. 알림 이벤트
    LOST_REGISTERED,            // 분실 신고 등록 완료
    FOUND_REGISTERED,           // 습득물 등록 완료
    MATCHING_FOUND,             // 매칭 후보 생성
    HANDOVER_REQUESTED,         // 인계 요청 생성
    HANDOVER_ACCEPTED,          // 인계 승인
    HANDOVER_REJECTED,          // 인계 거절
    HANDOVER_SCHEDULED,         // 인계 일정 확정
    HANDOVER_COMPLETED,         // 인계 완료
    SECURITY_VERIFIED,          // 보안 검수 완료
    OFFICE_APPROVED,            // 관리실 승인
    ITEM_BLINDED,               // 게시물 블라인드
    USER_BLOCKED,               // 사용자 정지
    MESSAGE_RECEIVED            // 메시지 수신
}