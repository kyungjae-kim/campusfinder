package com.bit.docker.found.dto.response;

import com.bit.docker.found.model.Category;
import com.bit.docker.found.model.FoundItem;
import com.bit.docker.found.model.FoundStatus;
import com.bit.docker.found.model.StorageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoundItemResponse {
    private Long id;
    private Long ownerUserId;
    private Category category;
    private String title;
    private String description;
    private LocalDateTime foundAt;
    private String foundPlace;
    private StorageType storageType;
    private String storageLocation;
    private FoundStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean requiresSecurityCheck;  // SECURITY 검수 필요 여부

    public static FoundItemResponse from(FoundItem item) {
        return new FoundItemResponse(
            item.getId(),
            item.getOwnerUserId(),
            item.getCategory(),
            item.getTitle(),
            item.getDescription(),
            item.getFoundAt(),
            item.getFoundPlace(),
            item.getStorageType(),
            item.getStorageLocation(),
            item.getStatus(),
            item.getCreatedAt(),
            item.getUpdatedAt(),
            item.getCategory().requiresSecurityCheck()  // 카테고리별 검수 필요 여부
        );
    }
}
