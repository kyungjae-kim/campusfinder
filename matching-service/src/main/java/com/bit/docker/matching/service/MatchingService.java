package com.bit.docker.matching.service;

import com.bit.docker.matching.config.ServiceUrlProperties;
import com.bit.docker.matching.dto.FoundItemDTO;
import com.bit.docker.matching.dto.LostItemDTO;
import com.bit.docker.matching.dto.response.MatchingResponse;
import com.bit.docker.matching.model.Matching;
import com.bit.docker.matching.repository.MatchingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchingService {
    private final MatchingRepository matchingRepository;
    private final RestTemplate restTemplate;
    private final ServiceUrlProperties serviceUrlProperties;
    
    /**
     * 분실 신고에 대한 매칭 후보 계산
     * 과제 규칙:
     * - 같은 category는 가산점
     * - 장소 문자열이 같은 건물/구역 키워드를 포함하면 가산점
     * - 날짜가 7일 이내로 가까우면 가산점
     * - title/description 키워드가 1개 이상 겹치면 가산점
     */
    @Transactional
    public List<MatchingResponse> findMatchingCandidatesForLost(Long lostId, int topN) {
        // Lost 서비스에서 분실 신고 조회
        LostItemDTO lostItem = getLostItemById(lostId);

        // Found 서비스에서 모든 습득물 조회 (상태가 REGISTERED 또는 STORED인 것만)
        List<FoundItemDTO> foundItems = getAllAvailableFoundItems();
        
        // 각 습득물에 대해 점수 계산
        List<MatchingResponse> candidates = new ArrayList<>();
        for (FoundItemDTO foundItem : foundItems) {
            int score = calculateMatchingScore(lostItem, foundItem);
            String reason = generateMatchingReason(lostItem, foundItem);
            
            MatchingResponse response = new MatchingResponse();
            response.setLostId(lostId);
            response.setFoundId(foundItem.getId());
            response.setScore(score);
            response.setReason(reason);
            response.setLostItem(lostItem);
            response.setFoundItem(foundItem);
            
            candidates.add(response);
            
            // 매칭 결과 저장 (선택적)
            saveMatching(lostId, foundItem.getId(), score, reason);
        }
        
        // 점수 높은 순으로 정렬 후 TOP N 반환
        return candidates.stream()
            .sorted(Comparator.comparing(MatchingResponse::getScore).reversed())
            .limit(topN)
            .collect(Collectors.toList());
    }
    
    /**
     * 습득물에 대한 매칭 후보 계산
     */
    @Transactional
    public List<MatchingResponse> findMatchingCandidatesForFound(Long foundId, int topN) {
        // Found 서비스에서 습득물 조회
        FoundItemDTO foundItem = getFoundItemById(foundId);
        
        // Lost 서비스에서 모든 분실 신고 조회 (상태가 OPEN인 것만)
        List<LostItemDTO> lostItems = getAllOpenLostItems();
        
        // 각 분실 신고에 대해 점수 계산
        List<MatchingResponse> candidates = new ArrayList<>();
        for (LostItemDTO lostItem : lostItems) {
            int score = calculateMatchingScore(lostItem, foundItem);
            String reason = generateMatchingReason(lostItem, foundItem);
            
            MatchingResponse response = new MatchingResponse();
            response.setLostId(lostItem.getId());
            response.setFoundId(foundId);
            response.setScore(score);
            response.setReason(reason);
            response.setLostItem(lostItem);
            response.setFoundItem(foundItem);
            
            candidates.add(response);
            
            // 매칭 결과 저장 (선택적)
            saveMatching(lostItem.getId(), foundId, score, reason);
        }
        
        // 점수 높은 순으로 정렬 후 TOP N 반환
        return candidates.stream()
            .sorted(Comparator.comparing(MatchingResponse::getScore).reversed())
            .limit(topN)
            .collect(Collectors.toList());
    }
    
    /**
     * 매칭 점수 계산 (규칙 기반)
     */
    private int calculateMatchingScore(LostItemDTO lostItem, FoundItemDTO foundItem) {
        int score = 0;
        
        // 1. 카테고리 일치 (30점)
        if (lostItem.getCategory() != null && lostItem.getCategory().equals(foundItem.getCategory())) {
            score += 30;
        }
        
        // 2. 장소 유사도 (20점)
        if (isSimilarPlace(lostItem.getLostPlace(), foundItem.getFoundPlace())) {
            score += 20;
        }
        
        // 3. 날짜 근접도 (7일 이내면 15점)
        long daysDiff = ChronoUnit.DAYS.between(lostItem.getLostAt(), foundItem.getFoundAt());
        if (Math.abs(daysDiff) <= 7) {
            score += 15;
        }
        
        // 4. 키워드 매칭 (10점 * 매칭된 키워드 수)
        int keywordMatches = countKeywordMatches(lostItem, foundItem);
        score += keywordMatches * 10;
        
        return score;
    }
    
    /**
     * 장소 유사도 판단 (같은 건물/구역 키워드 포함)
     */
    private boolean isSimilarPlace(String place1, String place2) {
        if (place1 == null || place2 == null) {
            return false;
        }
        
        // 간단한 키워드 매칭 (대소문자 무시)
        String p1 = place1.toLowerCase().replaceAll("\\s+", "");
        String p2 = place2.toLowerCase().replaceAll("\\s+", "");
        
        // 공통 건물/구역 키워드
        String[] keywords = {"공학관", "도서관", "학생회관", "기숙사", "체육관", "식당", "카페", "강의실"};
        
        for (String keyword : keywords) {
            if (p1.contains(keyword) && p2.contains(keyword)) {
                return true;
            }
        }
        
        // 부분 문자열 매칭 (50% 이상 겹치면)
        int minLength = Math.min(p1.length(), p2.length());
        for (int len = minLength; len >= 3; len--) {
            for (int i = 0; i <= p1.length() - len; i++) {
                String substring = p1.substring(i, i + len);
                if (p2.contains(substring)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 키워드 매칭 개수 세기
     */
    private int countKeywordMatches(LostItemDTO lostItem, FoundItemDTO foundItem) {
        // title과 description에서 키워드 추출
        Set<String> lostKeywords = extractKeywords(lostItem.getTitle(), lostItem.getDescription());
        Set<String> foundKeywords = extractKeywords(foundItem.getTitle(), foundItem.getDescription());
        
        // 교집합 개수 반환
        lostKeywords.retainAll(foundKeywords);
        return lostKeywords.size();
    }
    
    /**
     * 텍스트에서 키워드 추출 (간단한 토큰화)
     */
    private Set<String> extractKeywords(String title, String description) {
        Set<String> keywords = new HashSet<>();
        
        if (title != null) {
            keywords.addAll(tokenize(title));
        }
        if (description != null) {
            keywords.addAll(tokenize(description));
        }
        
        return keywords;
    }
    
    /**
     * 텍스트 토큰화 (공백/특수문자 기준, 2글자 이상만)
     */
    private Set<String> tokenize(String text) {
        Set<String> tokens = new HashSet<>();
        
        // 공백 및 특수문자로 분리
        String[] words = text.toLowerCase().split("[\\s,./;:!?()\\[\\]{}\"']+");
        
        for (String word : words) {
            if (word.length() >= 2) {  // 2글자 이상만
                tokens.add(word);
            }
        }
        
        return tokens;
    }
    
    /**
     * 매칭 이유 생성
     */
    private String generateMatchingReason(LostItemDTO lostItem, FoundItemDTO foundItem) {
        List<String> reasons = new ArrayList<>();
        
        if (lostItem.getCategory() != null && lostItem.getCategory().equals(foundItem.getCategory())) {
            reasons.add("카테고리 일치");
        }
        
        if (isSimilarPlace(lostItem.getLostPlace(), foundItem.getFoundPlace())) {
            reasons.add("장소 근접");
        }
        
        long daysDiff = Math.abs(ChronoUnit.DAYS.between(lostItem.getLostAt(), foundItem.getFoundAt()));
        if (daysDiff <= 7) {
            reasons.add("날짜 근접(" + daysDiff + "일 차이)");
        }
        
        int keywordMatches = countKeywordMatches(lostItem, foundItem);
        if (keywordMatches > 0) {
            reasons.add("키워드 " + keywordMatches + "개 일치");
        }
        
        return reasons.isEmpty() ? "일치 항목 없음" : String.join(", ", reasons);
    }
    
    /**
     * 매칭 결과 저장 (선택적)
     */
    @Transactional
    private void saveMatching(Long lostId, Long foundId, int score, String reason) {
        // 이미 존재하는 매칭이면 업데이트
        Optional<Matching> existing = matchingRepository.findByLostIdAndFoundId(lostId, foundId);
        
        if (existing.isPresent()) {
            Matching matching = existing.get();
            matching.setScore(score);
            matching.setReason(reason);
        } else {
            Matching matching = new Matching();
            matching.setLostId(lostId);
            matching.setFoundId(foundId);
            matching.setScore(score);
            matching.setReason(reason);
            matching.setViewed(false);
            matchingRepository.save(matching);
        }
    }
    
    // Lost 서비스에서 분실 신고 조회
    private LostItemDTO getLostItemById(Long lostId) {
        try {
            String url = serviceUrlProperties.getLostService().getUrl() + "/api/lost/" + lostId;
            ResponseEntity<LostItemDTO> response = restTemplate.getForEntity(url, LostItemDTO.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Lost 서비스 호출 실패: " + e.getMessage(), e);
        }
    }

    // Found 서비스에서 습득물 조회
    private FoundItemDTO getFoundItemById(Long foundId) {
        try {
            String url = serviceUrlProperties.getFoundService().getUrl() + "/api/found/" + foundId;
            ResponseEntity<FoundItemDTO> response = restTemplate.getForEntity(url, FoundItemDTO.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Found 서비스 호출 실패: " + e.getMessage(), e);
        }
    }

    // Found 서비스에서 사용 가능한 습득물 조회 (REGISTERED, STORED 상태)
    private List<FoundItemDTO> getAllAvailableFoundItems() {
        try {
            String url = serviceUrlProperties.getFoundService().getUrl() + "/api/found?size=1000";

            // Page<FoundItemDTO> 형태로 받아오기
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("content")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> content = (List<Map<String, Object>>) body.get("content");

                return content.stream()
                    .map(this::mapToFoundItemDTO)
                    .filter(item -> "REGISTERED".equals(item.getStatus()) || "STORED".equals(item.getStatus()))
                    .collect(Collectors.toList());
            }

            return new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Found 서비스 호출 실패: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Lost 서비스에서 OPEN 상태인 분실 신고 조회
    private List<LostItemDTO> getAllOpenLostItems() {
        try {
            String url = serviceUrlProperties.getLostService().getUrl() + "/api/lost?size=1000";

            // Page<LostItemDTO> 형태로 받아오기
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("content")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> content = (List<Map<String, Object>>) body.get("content");

                return content.stream()
                    .map(this::mapToLostItemDTO)
                    .filter(item -> "OPEN".equals(item.getStatus()))
                    .collect(Collectors.toList());
            }

            return new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Lost 서비스 호출 실패: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Map을 FoundItemDTO로 변환
    private FoundItemDTO mapToFoundItemDTO(Map<String, Object> map) {
        FoundItemDTO dto = new FoundItemDTO();
        dto.setId(((Number) map.get("id")).longValue());
        dto.setCategory((String) map.get("category"));
        dto.setTitle((String) map.get("title"));
        dto.setDescription((String) map.get("description"));
        dto.setFoundPlace((String) map.get("foundPlace"));
        dto.setStatus((String) map.get("status"));
        
        // foundAt 날짜 변환
        if (map.get("foundAt") != null) {
            dto.setFoundAt(parseDateTime(map.get("foundAt")));
        }
        return dto;
    }

    // Map을 LostItemDTO로 변환
    private LostItemDTO mapToLostItemDTO(Map<String, Object> map) {
        LostItemDTO dto = new LostItemDTO();
        dto.setId(((Number) map.get("id")).longValue());
        dto.setCategory((String) map.get("category"));
        dto.setTitle((String) map.get("title"));
        dto.setDescription((String) map.get("description"));
        dto.setLostPlace((String) map.get("lostPlace"));
        dto.setStatus((String) map.get("status"));
        
        // lostAt 날짜 변환
        if (map.get("lostAt") != null) {
            dto.setLostAt(parseDateTime(map.get("lostAt")));
        }
        return dto;
    }
    
    // 날짜/시간 문자열을 LocalDateTime으로 변환
    private java.time.LocalDateTime parseDateTime(Object dateObj) {
        if (dateObj == null) {
            return null;
        }
        
        if (dateObj instanceof String) {
            try {
                return java.time.LocalDateTime.parse((String) dateObj);
            } catch (Exception e) {
                // ISO 형식이 아닐 경우 현재 시간으로 대체
                return java.time.LocalDateTime.now();
            }
        } else if (dateObj instanceof List) {
            // [2024, 1, 15, 10, 30, 45] 형태
            @SuppressWarnings("unchecked")
            List<Integer> dateArray = (List<Integer>) dateObj;
            if (dateArray.size() >= 3) {
                return java.time.LocalDateTime.of(
                    dateArray.get(0), // year
                    dateArray.get(1), // month
                    dateArray.get(2), // day
                    dateArray.size() > 3 ? dateArray.get(3) : 0, // hour
                    dateArray.size() > 4 ? dateArray.get(4) : 0, // minute
                    dateArray.size() > 5 ? dateArray.get(5) : 0  // second
                );
            }
        }
        
        return java.time.LocalDateTime.now();
    }
}
