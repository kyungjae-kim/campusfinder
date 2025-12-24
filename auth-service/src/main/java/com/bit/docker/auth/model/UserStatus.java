package com.bit.docker.auth.model;

public enum UserStatus {
    ACTIVE,     // 활성
    BLOCKED,    // 정지 (A3. 글 등록/메시지/인계 요청 불가)
    INACTIVE    // 비활성 (선택)
}
