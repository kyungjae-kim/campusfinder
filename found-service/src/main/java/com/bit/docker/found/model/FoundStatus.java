package com.bit.docker.found.model;

public enum FoundStatus {
    REGISTERED,     // 등록됨
    STORED,         // 보관중
    IN_HANDOVER,    // 인계중
    HANDED_OVER,    // 인계완료
    DISCARDED       // 폐기
}