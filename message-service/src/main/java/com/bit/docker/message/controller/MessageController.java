package com.bit.docker.message.controller;

import com.bit.docker.message.dto.request.MessageSendRequest;
import com.bit.docker.message.dto.response.MessageResponse;
import com.bit.docker.message.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    
    // 메시지 전송
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Status") String userStatus,
        @RequestBody MessageSendRequest request
    ) {
        // 정지된 사용자는 메시지 전송 불가 (A3)
        if ("BLOCKED".equals(userStatus)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        MessageResponse response = messageService.sendMessage(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 인계 건의 채팅 내역 조회
    @GetMapping("/handover/{handoverId}")
    public ResponseEntity<List<MessageResponse>> getMessagesByHandover(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        List<MessageResponse> response = messageService.getMessagesByHandover(handoverId, userId);
        return ResponseEntity.ok(response);
    }
    
    // 메시지 읽음 처리
    @PutMapping("/{messageId}/read")
    public ResponseEntity<MessageResponse> markAsRead(
        @PathVariable Long messageId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        MessageResponse response = messageService.markAsRead(messageId, userId);
        return ResponseEntity.ok(response);
    }
    
    // 인계 건의 모든 메시지 읽음 처리
    @PutMapping("/handover/{handoverId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
        @PathVariable Long handoverId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        messageService.markAllAsRead(handoverId, userId);
        return ResponseEntity.ok().build();
    }
    
    // 읽지 않은 메시지 개수
    @GetMapping("/handover/{handoverId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
        @PathVariable Long handoverId
    ) {
        long count = messageService.getUnreadCount(handoverId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    // 메시지 신고
    @PostMapping("/{messageId}/report")
    public ResponseEntity<Void> reportMessage(
        @PathVariable Long messageId,
        @RequestHeader("X-User-Id") Long userId
    ) {
        messageService.reportMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }
    
    // 메시지 블라인드 (관리자용)
    @PostMapping("/{messageId}/blind")
    public ResponseEntity<Void> blindMessage(
        @PathVariable Long messageId,
        @RequestHeader("X-User-Role") String role
    ) {
        // Role이 ADMIN인지 확인
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        messageService.blindMessage(messageId);
        return ResponseEntity.ok().build();
    }
}
