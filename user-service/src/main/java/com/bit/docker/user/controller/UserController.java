package com.bit.docker.user.controller;

import com.bit.docker.user.dto.request.UserRegisterRequest;
import com.bit.docker.user.dto.response.UserResponse;
import com.bit.docker.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    // 사용자 조회 (단일)
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        UserResponse response = userService.getUser(userId);
        return ResponseEntity.ok(response);
    }
    
    // 사용자 목록 (관리자용)
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(Pageable pageable) {
        Page<UserResponse> response = userService.getUsers(pageable);
        return ResponseEntity.ok(response);
    }
    
    // 사용자 정지 (관리자용)
    @PostMapping("/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId) {
        userService.blockUser(userId);
        return ResponseEntity.ok().build();
    }
    
    // 사용자 정지 해제 (관리자용)
    @PostMapping("/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userId) {
        userService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }
    
    // 상태 확인 (다른 서비스에서 호출)
    @GetMapping("/{userId}/blocked")
    public ResponseEntity<Boolean> isUserBlocked(@PathVariable Long userId) {
        boolean blocked = userService.isUserBlocked(userId);
        return ResponseEntity.ok(blocked);
    }
}
