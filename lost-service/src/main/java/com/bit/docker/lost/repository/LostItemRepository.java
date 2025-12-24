package com.bit.docker.lost.repository;

import com.bit.docker.lost.model.Category;
import com.bit.docker.lost.model.LostItem;
import com.bit.docker.lost.model.LostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    // 사용자별 분실 신고 조회
    List<LostItem> findByUserId(Long userId);
    Page<LostItem> findByUserId(Long userId, Pageable pageable);
    
    // 상태별 조회
    Page<LostItem> findByStatus(LostStatus status, Pageable pageable);
    
    // 카테고리별 조회
    Page<LostItem> findByCategory(Category category, Pageable pageable);
    
    // 전체 검색 (제목+설명)
    Page<LostItem> findByTitleContainingOrDescriptionContaining(
        String title, String description, Pageable pageable
    );

    // 기간별 통계 (Admin에서 호출)
    long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
