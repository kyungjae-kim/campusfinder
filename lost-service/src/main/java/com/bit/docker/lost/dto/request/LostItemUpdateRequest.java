package com.bit.docker.lost.dto.request;

import com.bit.docker.lost.model.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItemUpdateRequest {
    private Category category;
    private String title;
    private String description;
    private LocalDateTime lostAt;
    private String lostPlace;
    private Integer reward;
}
