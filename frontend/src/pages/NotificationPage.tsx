import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '@/api/notification.api';
import type { Notification, NotificationType } from '@/types/notification.types';
import Loading from '@/components/common/Loading';
import { formatRelativeTime } from '@/utils/formatters';

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getMy();
      setNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '알림을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      alert(err.response?.data?.message || '모두 읽음 처리에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // 관련 페이지로 이동
    if (notification.relatedType && notification.relatedId) {
      switch (notification.relatedType) {
        case 'LOST':
          navigate(`/lost/${notification.relatedId}`);
          break;
        case 'FOUND':
          navigate(`/found/${notification.relatedId}`);
          break;
        case 'HANDOVER':
          navigate(`/handover/${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
            ← 대시보드
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>
            알림함
            {unreadCount > 0 && (
              <span style={{
                marginLeft: '10px',
                padding: '4px 12px',
                backgroundColor: '#ff3333',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'ALL' ? '#0066cc' : 'white',
            color: filter === 'ALL' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          전체 ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'UNREAD' ? '#0066cc' : 'white',
            color: filter === 'UNREAD' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          읽지 않음 ({unreadCount})
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#ffe6e6', 
          color: '#cc0000', 
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* 알림 목록 */}
      {filteredNotifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {filter === 'ALL' ? '알림이 없습니다.' : '읽지 않은 알림이 없습니다.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              onDelete={() => handleDelete(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 알림 아이템 컴포넌트
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onClick, onDelete }: NotificationItemProps) {
  const config = getNotificationConfig(notification.type);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'start',
        gap: '16px',
        padding: '16px',
        border: notification.isRead ? '1px solid #ddd' : '2px solid #0066cc',
        borderRadius: '8px',
        backgroundColor: notification.isRead ? 'white' : '#f0f7ff',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* 아이콘 */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>

      {/* 내용 */}
      <div style={{ flex: 1 }} onClick={onClick}>
        {!notification.isRead && (
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ff3333',
            marginRight: '8px',
          }} />
        )}
        <h4 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px',
          fontWeight: notification.isRead ? 'normal' : 'bold',
        }}>
          {notification.title}
        </h4>
        <p style={{ 
          margin: '0 0 8px 0', 
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.5',
        }}>
          {notification.message}
        </p>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {formatRelativeTime(notification.createdAt)}
        </div>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          fontSize: '18px',
        }}
        title="삭제"
      >
        ✕
      </button>
    </div>
  );
}

// 알림 타입별 설정
function getNotificationConfig(type: NotificationType) {
  const configs: Record<NotificationType, { icon: string; bg: string }> = {
    LOST_CREATED: { icon: '📢', bg: '#e6f2ff' },
    FOUND_CREATED: { icon: '🎉', bg: '#e6fff2' },
    MATCHING_FOUND: { icon: '🔍', bg: '#fff4e6' },
    HANDOVER_REQUESTED: { icon: '📨', bg: '#f0e6ff' },
    HANDOVER_ACCEPTED: { icon: '✅', bg: '#e6fff2' },
    HANDOVER_REJECTED: { icon: '❌', bg: '#ffe6e6' },
    HANDOVER_SCHEDULED: { icon: '📅', bg: '#fff4e6' },
    HANDOVER_COMPLETED: { icon: '🎊', bg: '#e6fff9' },
    SECURITY_VERIFIED: { icon: '🔒', bg: '#f2e6ff' },
    OFFICE_APPROVED: { icon: '✓', bg: '#e6f2ff' },
    ADMIN_ACTION: { icon: '⚠️', bg: '#ffe6e6' },
  };

  return configs[type] || { icon: '📬', bg: '#f5f5f5' };
}
