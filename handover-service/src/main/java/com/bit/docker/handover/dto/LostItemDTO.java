package com.bit.docker.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItemDTO {
    private Long id;
    private Long userId;
    private String category;
    private String title;
    private String description;
    private LocalDateTime lostAt;
    private String lostPlace;
    private Integer reward;
    private String status;
}
