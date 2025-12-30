import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { LoginResponse } from '@/types/auth.types';
import { notificationApi } from '@/api/notification.api';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    fetchUnreadCount();
    
    // 30초마다 알림 갯수 업데이트
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      LOSER: '분실자',
      FINDER: '습득자',
      OFFICE: '관리실',
      SECURITY: '보안',
      ADMIN: '관리자',
      COURIER: '배송',
    };
    return labels[role] || role;
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container-fluid">
        {/* 로고/홈 버튼 */}
        <button
          className="btn btn-link navbar-brand text-decoration-none"
          onClick={() => navigate('/dashboard')}
          style={{ padding: 0 }}
        >
          <i className="bi bi-house-door me-2"></i>
          <span className="fw-bold">캠퍼스 분실물</span>
        </button>

        <div className="d-flex align-items-center gap-2">
          {/* 알림 아이콘 */}
          <button
            className="btn btn-light position-relative"
            onClick={() => navigate('/notifications')}
            title="알림함"
          >
            <i className="bi bi-bell fs-5"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* 사용자 정보 드롭다운 */}
          <div className="dropdown">
            <button
              className="btn btn-light d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold badge-${user.role.toLowerCase()}`}
                style={{ width: '32px', height: '32px', backgroundColor: getRoleBadgeColor(user.role) }}
              >
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="text-start d-none d-md-block">
                <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                  {user.nickname}
                </div>
                <div className="small text-muted">
                  {getRoleLabel(user.role)}
                </div>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => navigate('/profile')}>
                  <i className="bi bi-person me-2"></i>프로필
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>로그아웃
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    LOSER: '#0066cc',
    FINDER: '#00cc66',
    OFFICE: '#ff9900',
    SECURITY: '#9933ff',
    ADMIN: '#cc0000',
    COURIER: '#00cccc',
  };
  return colors[role] || '#666';
}
