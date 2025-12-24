package com.bit.docker.found.repository;

import com.bit.docker.found.model.Category;
import com.bit.docker.found.model.FoundItem;
import com.bit.docker.found.model.FoundStatus;
import com.bit.docker.found.model.StorageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {
    // 습득자별 조회
    List<FoundItem> findByOwnerUserId(Long ownerUserId);
    Page<FoundItem> findByOwnerUserId(Long ownerUserId, Pageable pageable);
    
    // 상태별 조회
    Page<FoundItem> findByStatus(FoundStatus status, Pageable pageable);
    
    // 보관 방식별 조회
    Page<FoundItem> findByStorageType(StorageType storageType, Pageable pageable);
    
    // 카테고리별 조회
    Page<FoundItem> findByCategory(Category category, Pageable pageable);
    
    // 전체 검색
    Page<FoundItem> findByTitleContainingOrDescriptionContaining(
        String title, String description, Pageable pageable
    );
    
    // 기간별 통계 (Admin에서 호출)
    long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
