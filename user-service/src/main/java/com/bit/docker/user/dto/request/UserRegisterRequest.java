package com.bit.docker.user.dto.request;

import com.bit.docker.user.model.Affiliation;
import com.bit.docker.user.model.UserRole;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterRequest {
    @NotBlank(message = "아이디는 필수입니다")
    @Size(min = 4, max = 50, message = "아이디는 4~50자여야 합니다")
    private String username;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 6, max = 100, message = "비밀번호는 6~100자여야 합니다")
    private String password;
    
    @NotBlank(message = "닉네임은 필수입니다")
    @Size(max = 50, message = "닉네임은 50자 이하여야 합니다")
    private String nickname;
    
    @NotNull(message = "역할은 필수입니다")
    private UserRole role;
    
    private Affiliation affiliation;
    
    @Pattern(regexp = "^01[0-9]-[0-9]{4}-[0-9]{4}$", message = "올바른 전화번호 형식이 아닙니다")
    private String phone;
    
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
}
