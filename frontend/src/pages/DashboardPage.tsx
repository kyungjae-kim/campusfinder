import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { LoginResponse } from '@/types/auth.types';
import { notificationApi } from '@/api/notification.api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    // 읽지 않은 알림 개수 가져오기
    fetchUnreadCount();
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #eee',
      }}>
        <h1 style={{ margin: 0 }}>캠퍼스 분실물 플랫폼</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 알림 아이콘 */}
          <button
            onClick={() => navigate('/notifications')}
            style={{
              position: 'relative',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
            }}
            title="알림함"
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                padding: '2px 6px',
                backgroundColor: '#ff3333',
                color: 'white',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 'bold',
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* 사용자 정보 */}
          <button
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: getRoleColor(user.role),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              {user.nickname.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {user.nickname}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>
                {getRoleLabel(user.role)}
              </div>
            </div>
          </button>

          {/* 로그아웃 */}
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* 분실자 메뉴 */}
        {(user.role === 'LOSER' || user.role === 'ADMIN') && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>분실 신고</h2>
            <button onClick={() => navigate('/lost/create')} style={{ marginBottom: '10px', width: '100%' }}>
              분실 신고 등록
            </button>
            <button onClick={() => navigate('/lost/list')} style={{ width: '100%' }}>
              내 분실 신고 목록
            </button>
          </div>
        )}

        {/* 습득자 메뉴 */}
        {(user.role === 'FINDER' || user.role === 'OFFICE' || user.role === 'ADMIN') && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>습득물</h2>
            <button onClick={() => navigate('/found/create')} style={{ marginBottom: '10px', width: '100%' }}>
              습득물 등록
            </button>
            <button onClick={() => navigate('/found/list')} style={{ width: '100%' }}>
              내 습득물 목록
            </button>
          </div>
        )}

        {/* 인계 메뉴 (COURIER 제외) */}
        {user.role !== 'COURIER' && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>인계 관리</h2>
            <button onClick={() => navigate('/handover/my-requests')} style={{ marginBottom: '10px', width: '100%' }}>
              내 인계 요청
            </button>
            <button onClick={() => navigate('/handover/inbox')} style={{ width: '100%' }}>
              인계 수신함
            </button>
          </div>
        )}

        {/* 관리자 메뉴 */}
        {user.role === 'ADMIN' && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>관리자</h2>
            <button onClick={() => navigate('/admin/reports')} style={{ marginBottom: '10px', width: '100%' }}>
              신고 관리
            </button>
            <button onClick={() => navigate('/admin/users')} style={{ marginBottom: '10px', width: '100%' }}>
              사용자 관리
            </button>
            <button onClick={() => navigate('/admin/statistics')} style={{ width: '100%' }}>
              운영 통계
            </button>
          </div>
        )}

        {/* 관리실 메뉴 */}
        {user.role === 'OFFICE' && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>관리실</h2>
            <button onClick={() => navigate('/office/queue')} style={{ marginBottom: '10px', width: '100%' }}>
              접수 대기 목록
            </button>
            <button onClick={() => navigate('/office/storage')} style={{ width: '100%' }}>
              보관 관리
            </button>
          </div>
        )}

        {/* 보안 메뉴 */}
        {user.role === 'SECURITY' && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>보안</h2>
            <button onClick={() => navigate('/security/inspection')} style={{ marginBottom: '10px', width: '100%' }}>
              검수 목록
            </button>
            <button onClick={() => navigate('/security/approval')} style={{ width: '100%' }}>
              승인 관리
            </button>
          </div>
        )}

        {/* 배송 메뉴 (COURIER) */}
        {user.role === 'COURIER' && (
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>배송 관리</h2>
            <button onClick={() => navigate('/courier/delivery')} style={{ width: '100%' }}>
              📦 배송 목록
            </button>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', marginBottom: '0' }}>
              배송 방식 인계 건의 상태를 관리합니다<br/>
              (픽업 → 이동중 → 전달완료)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 역할별 색상
function getRoleColor(role: string): string {
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

// 역할 레이블
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    LOSER: '분실자',
    FINDER: '습득자',
    OFFICE: '관리실',
    SECURITY: '보안',
    ADMIN: '관리자',
    COURIER: '배송',
  };
  return labels[role] || role;
}
