package com.bit.docker.matching.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Found 서비스에서 가져올 데이터
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoundItemDTO {
    private Long id;
    private Long ownerUserId;
    private String category;
    private String title;
    private String description;
    private LocalDateTime foundAt;
    private String foundPlace;
    private String storageType;
    private String storageLocation;
    private String status;
}
