package com.bit.docker.user.dto.response;

import com.bit.docker.user.model.Affiliation;
import com.bit.docker.user.model.User;
import com.bit.docker.user.model.UserRole;
import com.bit.docker.user.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String nickname;
    private UserRole role;
    private UserStatus status;
    private Affiliation affiliation;
    private String phone;
    private String email;
    private LocalDateTime createdAt;
    
    // Entity -> DTO 변환
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getNickname(),
            user.getRole(),
            user.getStatus(),
            user.getAffiliation(),
            user.getPhone(),
            user.getEmail(),
            user.getCreatedAt()
        );
    }
}
