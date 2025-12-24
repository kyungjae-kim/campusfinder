package com.bit.docker.lost.dto.response;

import com.bit.docker.lost.model.Category;
import com.bit.docker.lost.model.LostItem;
import com.bit.docker.lost.model.LostStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItemResponse {
    private Long id;
    private Long userId;
    private Category category;
    private String title;
    private String description;
    private LocalDateTime lostAt;
    private String lostPlace;
    private Integer reward;
    private LostStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static LostItemResponse from(LostItem item) {
        return new LostItemResponse(
            item.getId(),
            item.getUserId(),
            item.getCategory(),
            item.getTitle(),
            item.getDescription(),
            item.getLostAt(),
            item.getLostPlace(),
            item.getReward(),
            item.getStatus(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }
}
