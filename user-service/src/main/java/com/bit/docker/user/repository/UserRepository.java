package com.bit.docker.user.repository;

import com.bit.docker.user.model.User;
import com.bit.docker.user.model.UserRole;
import com.bit.docker.user.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByStatus(UserStatus status);
    
    // 관리자가 사용자 검색할 때
    Page<User> findByNicknameContaining(String nickname, Pageable pageable);
}
