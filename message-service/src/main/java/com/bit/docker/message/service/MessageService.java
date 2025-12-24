package com.bit.docker.message.service;

import com.bit.docker.message.client.HandoverServiceClient;
import com.bit.docker.message.client.NotificationServiceClient;
import com.bit.docker.message.client.UserServiceClient;
import com.bit.docker.message.dto.HandoverDTO;
import com.bit.docker.message.dto.request.MessageSendRequest;
import com.bit.docker.message.dto.response.MessageResponse;
import com.bit.docker.message.model.Message;
import com.bit.docker.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {
    private final MessageRepository messageRepository;
    private final HandoverServiceClient handoverServiceClient;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    // 메시지 전송 (F1. 인계 건이 생성된 뒤에만 가능)
    @Transactional
    public MessageResponse sendMessage(Long senderId, MessageSendRequest request) {
        // Handover 서비스에서 handover 존재 확인 및 참여자 확인
        HandoverDTO handover = handoverServiceClient.getHandover(request.getHandoverId());

        // senderId가 해당 인계의 참여자인지 확인
        if (!handover.getRequesterId().equals(senderId) && !handover.getResponderId().equals(senderId)) {
            throw new IllegalArgumentException("인계 참여자만 메시지를 보낼 수 있습니다.");
        }

        // 사용자 서비스에서 senderId가 BLOCKED 상태인지 확인
        if (userServiceClient.isUserBlocked(senderId)) {
            throw new IllegalArgumentException("정지된 사용자는 메시지를 보낼 수 없습니다.");
        }

        Message message = new Message();
        message.setHandoverId(request.getHandoverId());
        message.setSenderId(senderId);
        message.setContent(request.getContent());
        message.setIsRead(false);
        message.setIsReported(false);
        message.setIsBlinded(false);

        Message saved = messageRepository.save(message);

        // Notification 서비스로 메시지 수신 알림 전송
        Long receiverId = handover.getRequesterId().equals(senderId) ?
            handover.getResponderId() : handover.getRequesterId();

        notificationServiceClient.sendNotification(
            receiverId,
            "MESSAGE_RECEIVED",
            "새 메시지",
            "새로운 메시지가 도착했습니다."
        );

        return MessageResponse.from(saved);
    }

    // 인계 건의 채팅 내역 조회 (F2. 참여자만 가능)
    public List<MessageResponse> getMessagesByHandover(Long handoverId, Long userId) {
        // userId가 해당 인계의 참여자인지 확인
        if (!handoverServiceClient.isParticipant(handoverId, userId)) {
            throw new IllegalArgumentException("인계 참여자만 채팅 내역을 볼 수 있습니다.");
        }

        return messageRepository.findByHandoverIdOrderByCreatedAtAsc(handoverId).stream()
            .map(MessageResponse::from)
            .collect(Collectors.toList());
    }

    // 메시지 읽음 처리
    @Transactional
    public MessageResponse markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));

        // userId가 메시지 수신자인지 확인 (senderId가 아닌 사람)
        if (message.getSenderId().equals(userId)) {
            throw new IllegalArgumentException("본인이 보낸 메시지는 읽음 처리할 수 없습니다.");
        }

        if (message.getIsRead()) {
            return MessageResponse.from(message);
        }

        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());

        return MessageResponse.from(message);
    }

    // 인계 건의 모든 메시지 읽음 처리
    @Transactional
    public void markAllAsRead(Long handoverId, Long userId) {
        List<Message> messages = messageRepository.findByHandoverIdAndIsReadFalseOrderByCreatedAtAsc(handoverId);

        LocalDateTime now = LocalDateTime.now();
        for (Message message : messages) {
            // 내가 보낸 메시지가 아닌 것만 읽음 처리
            if (!message.getSenderId().equals(userId)) {
                message.setIsRead(true);
                message.setReadAt(now);
            }
        }
    }

    // 읽지 않은 메시지 개수
    public long getUnreadCount(Long handoverId) {
        return messageRepository.countByHandoverIdAndIsReadFalse(handoverId);
    }

    // 메시지 신고 (F3. 신고 기능으로 처리)
    @Transactional
    public void reportMessage(Long messageId, Long reporterId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));

        // TODO: Admin 서비스로 신고 생성 (Admin 서비스 완성 후)
        
        message.setIsReported(true);
    }
    
    // 메시지 블라인드 (관리자용)
    @Transactional
    public void blindMessage(Long messageId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));
        
        message.setIsBlinded(true);
    }
}
