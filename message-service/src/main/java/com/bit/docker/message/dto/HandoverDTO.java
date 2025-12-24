package com.bit.docker.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HandoverDTO {
    private Long id;
    private Long requesterId;
    private Long responderId;
    private String status;
}
