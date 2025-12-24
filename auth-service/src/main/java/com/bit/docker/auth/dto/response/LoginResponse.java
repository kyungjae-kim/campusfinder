package com.bit.docker.auth.dto.response;

import com.bit.docker.auth.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long id;
    private String username;
    private String nickname;
    private UserRole role;
}
