package com.bit.docker.found.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "found_images")
@Data
@NoArgsConstructor
public class FoundImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long foundId;  // FoundItem ID

    @Column(nullable = false, length = 500)
    private String fileName;

    @Column(nullable = false, length = 500)
    private String storedPath;

    @Column(nullable = false)
    private Long fileSize;

    @Column(length = 50)
    private String mimeType;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}