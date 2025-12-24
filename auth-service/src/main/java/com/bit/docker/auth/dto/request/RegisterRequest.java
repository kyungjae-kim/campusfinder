package com.bit.docker.auth.dto.request;

import com.bit.docker.auth.model.Affiliation;
import com.bit.docker.auth.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String nickname;
    private UserRole role;
    private Affiliation affiliation;
    private String phone;
    private String email;
}
