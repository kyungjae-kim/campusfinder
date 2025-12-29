import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '@/api/notification.api';
import type { Notification } from '@/types/notification.types';
import Loading from '@/components/common/Loading';
import { formatDateTime } from '@/utils/formatters';

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getMy();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => notificationApi.markAsRead(n.id))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      LOST_CREATED: 'bi-exclamation-circle text-primary',
      FOUND_CREATED: 'bi-check-circle text-success',
      MATCH_FOUND: 'bi-link-45deg text-info',
      HANDOVER_REQUESTED: 'bi-send text-warning',
      HANDOVER_ACCEPTED: 'bi-check-square text-success',
      HANDOVER_REJECTED: 'bi-x-square text-danger',
      HANDOVER_COMPLETED: 'bi-check-all text-success',
      SECURITY_VERIFIED: 'bi-shield-check text-primary',
      ADMIN_ACTION: 'bi-shield-exclamation text-danger',
    };
    return icons[type] || 'bi-bell text-muted';
  };

  if (loading) return <Loading />;

  return (
    <div className="min-vh-100 bg-light">
      {/* 헤더 */}
      <nav className="navbar navbar-light bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <button 
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            대시보드로 돌아가기
          </button>

          {unreadCount > 0 && (
            <button 
              className="btn btn-outline-primary"
              onClick={handleMarkAllAsRead}
            >
              <i className="bi bi-check-all me-2"></i>
              모두 읽음 처리
            </button>
          )}
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-bell me-2"></i>
            알림
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </h2>
          <p className="text-muted mb-0">최신 알림을 확인하세요</p>
        </div>

        {/* 필터 */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              <i className="bi bi-list me-1"></i>
              전체
              <span className="badge bg-light text-dark ms-2">
                {notifications.length}
              </span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${filter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setFilter('UNREAD')}
            >
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }}></i>
              읽지 않음
              <span className="badge bg-light text-dark ms-2">
                {unreadCount}
              </span>
            </button>
          </li>
        </ul>

        {/* 알림 목록 */}
        {filteredNotifications.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-bell-slash fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">
                {filter === 'UNREAD' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
              </h5>
            </div>
          </div>
        ) : (
          <div className="list-group">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`list-group-item list-group-item-action ${
                  !notification.isRead ? 'bg-light' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-start">
                  {/* 아이콘 */}
                  <div className="me-3 flex-shrink-0">
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center ${
                        !notification.isRead ? 'bg-primary bg-opacity-10' : 'bg-light'
                      }`}
                      style={{ width: '48px', height: '48px' }}
                    >
                      <i className={`${getNotificationIcon(notification.type)} fs-5`}></i>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>
                            NEW
                          </span>
                        )}
                      </h6>
                      <small className="text-muted ms-2">
                        {formatDateTime(notification.createdAt)}
                      </small>
                    </div>
                    <p className={`mb-0 ${!notification.isRead ? 'text-dark' : 'text-muted'}`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* 읽음 버튼 */}
                  {!notification.isRead && (
                    <button
                      className="btn btn-sm btn-outline-primary ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      <i className="bi bi-check"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
