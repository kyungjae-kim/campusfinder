package com.bit.docker.lost.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lost_items")
@Data
@NoArgsConstructor
public class LostItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;  // 분실자 ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime lostAt;  // 분실 시각

    @Column(nullable = false, length = 200)
    private String lostPlace;  // 분실 장소

    private Integer reward;  // 사례금 (옵션)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LostStatus status = LostStatus.OPEN;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}