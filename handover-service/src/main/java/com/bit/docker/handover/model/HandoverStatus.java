package com.bit.docker.handover.model;

public enum HandoverStatus {
    REQUESTED,              // 요청됨
    ACCEPTED_BY_FINDER,     // 습득자 승인
    VERIFIED_BY_SECURITY,   // 보안 검수 완료 (전자기기/지갑/신분증만)
    APPROVED_BY_OFFICE,     // 관리실 승인
    SCHEDULED,              // 일정 확정
    COMPLETED,              // 인계 완료
    CANCELED,               // 취소됨
    REJECTED                // 거절됨
}