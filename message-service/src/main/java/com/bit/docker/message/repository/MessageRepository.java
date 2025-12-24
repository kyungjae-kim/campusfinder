package com.bit.docker.message.repository;

import com.bit.docker.message.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // 인계 건별 메시지 조회 (시간순)
    List<Message> findByHandoverIdOrderByCreatedAtAsc(Long handoverId);
    
    // 읽지 않은 메시지 조회
    List<Message> findByHandoverIdAndIsReadFalseOrderByCreatedAtAsc(Long handoverId);
    
    // 특정 사용자가 받은 읽지 않은 메시지 개수
    long countByHandoverIdAndIsReadFalse(Long handoverId);
}
