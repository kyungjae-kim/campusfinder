import { useState, useEffect, useRef } from 'react';
import { messageApi } from '@/api/message.api';
import type { Message } from '@/types/message.types';
import { formatDateTime } from '@/utils/formatters';

interface ChatBoxProps {
  handoverId: number;
  currentUserId: number;
}

export default function ChatBox({ handoverId, currentUserId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // 실제로는 WebSocket이나 polling으로 실시간 업데이트
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [handoverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messageApi.getByHandover(handoverId);
      setMessages(data);
      
      // 읽지 않은 메시지 읽음 처리
      const unreadMessages = data.filter(m => !m.isRead && m.senderId !== currentUserId);
      if (unreadMessages.length > 0) {
        await messageApi.markAllAsRead(handoverId);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await messageApi.send({
        handoverId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await fetchMessages();
    } catch (err: any) {
      alert(err.response?.data?.message || '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
    }}>
      {/* 헤더 */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold',
      }}>
        💬 채팅
      </div>

      {/* 메시지 목록 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            로딩 중...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            아직 메시지가 없습니다.
            <br />
            첫 메시지를 보내보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            
            if (msg.isBlinded) {
              return (
                <div
                  key={msg.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#999',
                    fontStyle: 'italic',
                    textAlign: 'center',
                  }}
                >
                  ⚠️ 관리자에 의해 블라인드된 메시지입니다.
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                }}
              >
                {!isMine && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginBottom: '4px',
                    paddingLeft: '8px',
                  }}>
                    {msg.senderNickname}
                  </div>
                )}
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: isMine ? '#0066cc' : '#f0f0f0',
                    color: isMine ? 'white' : '#333',
                    borderRadius: '12px',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#999', 
                  marginTop: '4px',
                  paddingLeft: '8px',
                  textAlign: isMine ? 'right' : 'left',
                }}>
                  {formatDateTime(msg.createdAt)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '8px',
      }}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요 (Shift+Enter로 줄바꿈)"
          rows={2}
          style={{ 
            flex: 1, 
            padding: '10px', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            resize: 'none',
            fontSize: '14px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: sending || !newMessage.trim() ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {sending ? '전송 중...' : '전송'}
        </button>
      </div>
    </div>
  );
}
