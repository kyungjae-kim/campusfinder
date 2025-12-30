package com.bit.docker.lost.service;

import com.bit.docker.lost.dto.request.LostItemCreateRequest;
import com.bit.docker.lost.dto.request.LostItemUpdateRequest;
import com.bit.docker.lost.dto.response.LostItemResponse;
import com.bit.docker.lost.model.LostItem;
import com.bit.docker.lost.model.LostStatus;
import com.bit.docker.lost.repository.LostItemRepository;
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
public class LostItemService {
    private final LostItemRepository lostItemRepository;
    
    // 분실 신고 등록
    @Transactional
    public LostItemResponse createLostItem(Long userId, LostItemCreateRequest request) {
        LostItem item = new LostItem();
        item.setUserId(userId);
        item.setCategory(request.getCategory());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLostAt(request.getLostAt());
        item.setLostPlace(request.getLostPlace());
        item.setReward(request.getReward());
        item.setStatus(LostStatus.OPEN);
        
        LostItem saved = lostItemRepository.save(item);
        return LostItemResponse.from(saved);
    }
    
    // 분실 신고 목록 (전체)
    public Page<LostItemResponse> getAllLostItems(Pageable pageable) {
        return lostItemRepository.findAll(pageable)
            .map(LostItemResponse::from);
    }
    
    // 내 분실 신고 목록
    public List<LostItemResponse> getMyLostItems(Long userId) {
        return lostItemRepository.findByUserId(userId).stream()
            .map(LostItemResponse::from)
            .collect(Collectors.toList());
    }
    
    // 분실 신고 상세
    public LostItemResponse getLostItem(Long id) {
        LostItem item = lostItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("분실 신고를 찾을 수 없습니다."));
        return LostItemResponse.from(item);
    }
    
    // 분실 신고 수정
    @Transactional
    public LostItemResponse updateLostItem(Long id, Long userId, String role, LostItemUpdateRequest request) {
        LostItem item = lostItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("분실 신고를 찾을 수 없습니다."));
        
        // 작성자 확인 (ADMIN은 모든 글 수정 가능)
        if (!"ADMIN".equals(role) && !item.getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }
        
        item.setCategory(request.getCategory());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLostAt(request.getLostAt());
        item.setLostPlace(request.getLostPlace());
        item.setReward(request.getReward());
        
        return LostItemResponse.from(item);
    }
    
    // 분실 신고 삭제
    @Transactional
    public void deleteLostItem(Long id, Long userId, String role) {
        LostItem item = lostItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("분실 신고를 찾을 수 없습니다."));
        
        // 작성자 확인 (ADMIN은 모든 글 삭제 가능)
        if (!"ADMIN".equals(role) && !item.getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
        
        lostItemRepository.delete(item);
    }
    
    // 상태 변경
    @Transactional
    public void updateStatus(Long id, LostStatus status) {
        LostItem item = lostItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("분실 신고를 찾을 수 없습니다."));
        item.setStatus(status);
    }
    
    // 기간별 통계 (Admin에서 호출)
    public long countByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return lostItemRepository.count();
        }
        // LocalDate를 LocalDateTime으로 변환 (하루의 시작과 끝)
        java.time.LocalDateTime startDateTime = startDate.atStartOfDay();
        java.time.LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        return lostItemRepository.countByCreatedAtBetween(startDateTime, endDateTime);
    }
}
