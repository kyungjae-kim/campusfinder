package com.bit.docker.found.dto.request;

import com.bit.docker.found.model.Category;
import com.bit.docker.found.model.StorageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoundItemUpdateRequest {
    private Category category;
    private String title;
    private String description;
    private LocalDateTime foundAt;
    private String foundPlace;
    private StorageType storageType;
    private String storageLocation;
}
