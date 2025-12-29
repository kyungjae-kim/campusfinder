package com.bit.docker.user.service;

import com.bit.docker.user.dto.response.UserResponse;
import com.bit.docker.user.model.User;
import com.bit.docker.user.model.UserRole;
import com.bit.docker.user.model.UserStatus;
import com.bit.docker.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    // 사용자 조회
    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserResponse.from(user);
    }
    
    // 사용자 목록 (관리자용)
    public Page<UserResponse> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
            .map(UserResponse::from);
    }
    
    // 사용자 정지 (A3. 정지된 사용자는 글 등록/메시지/인계 요청 불가)
    @Transactional
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        user.setStatus(UserStatus.BLOCKED);
    }
    
    // 사용자 정지 해제
    @Transactional
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        user.setStatus(UserStatus.ACTIVE);
    }
    
    // 상태 확인 (다른 서비스에서 호출)
    public boolean isUserBlocked(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return user.getStatus() == UserStatus.BLOCKED;
    }

    // 역할별 사용자 조회 (다른 서비스에서 호출)
    public Page<UserResponse> getUsersByRole(String role, Pageable pageable) {
        // String을 UserRole enum으로 변환
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 역할입니다: " + role);
        }
        
        // Repository에서 제공하는 findByRole 사용
        List<User> users = userRepository.findByRole(userRole);
        
        // List를 Page로 변환
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), users.size());
        List<UserResponse> content = users.subList(start, Math.min(end, users.size())).stream()
            .map(UserResponse::from)
            .toList();
        
        return new PageImpl<>(content, pageable, users.size());
    }
}
