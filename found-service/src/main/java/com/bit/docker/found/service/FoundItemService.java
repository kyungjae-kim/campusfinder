package com.bit.docker.found.service;

import com.bit.docker.found.dto.request.FoundItemCreateRequest;
import com.bit.docker.found.dto.request.FoundItemUpdateRequest;
import com.bit.docker.found.dto.response.FoundItemResponse;
import com.bit.docker.found.model.FoundItem;
import com.bit.docker.found.model.FoundStatus;
import com.bit.docker.found.repository.FoundItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FoundItemService {
    private final FoundItemRepository foundItemRepository;
    
    // 습득물 등록
    @Transactional
    public FoundItemResponse createFoundItem(Long userId, FoundItemCreateRequest request) {
        FoundItem item = new FoundItem();
        item.setOwnerUserId(userId);
        item.setCategory(request.getCategory());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setFoundAt(request.getFoundAt());
        item.setFoundPlace(request.getFoundPlace());
        item.setStorageType(request.getStorageType());
        item.setStorageLocation(request.getStorageLocation());
        item.setStatus(FoundStatus.REGISTERED);
        
        FoundItem saved = foundItemRepository.save(item);
        return FoundItemResponse.from(saved);
    }
    
    // 습득물 목록 (전체)
    public Page<FoundItemResponse> getAllFoundItems(Pageable pageable) {
        return foundItemRepository.findAll(pageable)
            .map(FoundItemResponse::from);
    }
    
    // 내 습득물 목록
    public List<FoundItemResponse> getMyFoundItems(Long userId) {
        return foundItemRepository.findByOwnerUserId(userId).stream()
            .map(FoundItemResponse::from)
            .collect(Collectors.toList());
    }
    
    // 습득물 상세
    public FoundItemResponse getFoundItem(Long id) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("습득물을 찾을 수 없습니다."));
        return FoundItemResponse.from(item);
    }
    
    // 습득물 수정
    @Transactional
    public FoundItemResponse updateFoundItem(Long id, Long userId, String role, FoundItemUpdateRequest request) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("습득물을 찾을 수 없습니다."));
        
        // 작성자 확인 (ADMIN은 모든 글 수정 가능)
        if (!"ADMIN".equals(role) && !item.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }
        
        item.setCategory(request.getCategory());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setFoundAt(request.getFoundAt());
        item.setFoundPlace(request.getFoundPlace());
        item.setStorageType(request.getStorageType());
        item.setStorageLocation(request.getStorageLocation());
        
        return FoundItemResponse.from(item);
    }
    
    // 습득물 삭제
    @Transactional
    public void deleteFoundItem(Long id, Long userId, String role) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("습득물을 찾을 수 없습니다."));
        
        // 작성자 확인 (ADMIN은 모든 글 삭제 가능)
        if (!"ADMIN".equals(role) && !item.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
        
        foundItemRepository.delete(item);
    }
    
    // 상태 변경
    @Transactional
    public void updateStatus(Long id, FoundStatus status) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("습득물을 찾을 수 없습니다."));
        item.setStatus(status);
    }
    
    // 보관 처리 (OFFICE용)
    @Transactional
    public FoundItemResponse updateStorage(Long id, String storageLocation) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("습득물을 찾을 수 없습니다."));
        
        item.setStorageLocation(storageLocation);
        item.setStatus(FoundStatus.STORED);
        
        return FoundItemResponse.from(item);
    }

    // 기간별 통계 (Admin에서 호출)
    public long countByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return foundItemRepository.count();
        }
        // LocalDate를 LocalDateTime으로 변환 (하루의 시작과 끝)
        java.time.LocalDateTime startDateTime = startDate.atStartOfDay();
        java.time.LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        return foundItemRepository.countByCreatedAtBetween(startDateTime, endDateTime);
    }
}
