package com.bit.docker.auth.controller;

import com.bit.docker.auth.dto.request.LoginRequest;
import com.bit.docker.auth.dto.request.RegisterRequest;
import com.bit.docker.auth.dto.response.LoginResponse;
import com.bit.docker.auth.dto.response.UserResponse;
import com.bit.docker.auth.model.User;
import com.bit.docker.auth.model.UserStatus;
import com.bit.docker.auth.repository.UserRepository;
import com.bit.docker.auth.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // 1. 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 존재하는 아이디입니다");
        }

        // 2. User 엔티티 생성 (새 필드들 포함)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setAffiliation(request.getAffiliation());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(saved));
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // 1. 사용자 찾기
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다");
        }

        // 2. 비밀번호 확인
        User user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다");
        }

        // 3. 정지된 사용자도 로그인은 허용 (글 등록/인계 요청/메시지는 각 서비스에서 차단)
        // 상태를 토큰에 포함하여 각 서비스에서 체크할 수 있도록 함

        // 4. 토큰 생성 (role, status 포함!)
        String token = jwtTokenProvider.createToken(
            user.getId(),
            user.getUsername(),
            user.getNickname(),
            user.getRole(),
            user.getStatus()
        );

        // 5. 응답
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus()); // 프론트엔드에서 상태 확인 가능

        return ResponseEntity.ok(response);
    }
}

