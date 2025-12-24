package com.bit.docker.matching.repository;

import com.bit.docker.matching.model.Matching;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchingRepository extends JpaRepository<Matching, Long> {
    // 분실 신고별 매칭 후보 조회
    List<Matching> findByLostIdOrderByScoreDesc(Long lostId);
    
    // 습득물별 매칭 후보 조회
    List<Matching> findByFoundIdOrderByScoreDesc(Long foundId);
    
    // 특정 조합 조회
    Optional<Matching> findByLostIdAndFoundId(Long lostId, Long foundId);
}
