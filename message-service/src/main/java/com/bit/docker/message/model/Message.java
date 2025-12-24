package com.bit.docker.message.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long handoverId;  // 인계 건 ID (F1. 인계 건이 생성된 뒤에만 가능)

    @Column(nullable = false)
    private Long senderId;  // 발신자 ID

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;  // 메시지 내용

    @Column(nullable = false)
    private Boolean isRead = false;  // 읽음 여부

    private LocalDateTime readAt;  // 읽은 시각

    @Column(nullable = false)
    private Boolean isReported = false;  // 신고됨 여부

    @Column(nullable = false)
    private Boolean isBlinded = false;  // 블라인드 처리됨

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}