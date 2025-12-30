package com.bit.docker.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private Boolean requiresSecurityCheck;  // SECURITY 검수 필요 여부
}
