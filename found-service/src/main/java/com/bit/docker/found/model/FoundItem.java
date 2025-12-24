package com.bit.docker.found.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "found_items")
@Data
@NoArgsConstructor
public class FoundItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerUserId;  // 습득자 ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime foundAt;  // 습득 시각

    @Column(nullable = false, length = 200)
    private String foundPlace;  // 습득 장소

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StorageType storageType;

    @Column(length = 200)
    private String storageLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FoundStatus status = FoundStatus.REGISTERED;

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