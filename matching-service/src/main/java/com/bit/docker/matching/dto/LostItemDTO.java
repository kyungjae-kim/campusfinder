package com.bit.docker.matching.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Lost 서비스에서 가져올 데이터
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
