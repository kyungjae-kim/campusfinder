package com.bit.docker.matching.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "matchings")
@Data
@NoArgsConstructor
public class Matching {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lostId;

    @Column(nullable = false)
    private Long foundId;

    @Column(nullable = false)
    private Integer score;  // 매칭 점수

    @Column(length = 500)
    private String reason;  // 매칭 이유 (카테고리 일치, 장소 근접 등)

    @Column(nullable = false)
    private Boolean viewed = false;  // 분실자가 확인했는지

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}