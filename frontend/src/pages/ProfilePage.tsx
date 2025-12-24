import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import { foundApi } from '@/api/found.api';
import { handoverApi } from '@/api/handover.api';
import type { LoginResponse } from '@/types/auth.types';
import Loading from '@/components/common/Loading';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    handoverRequestCount: 0,
    handoverResponseCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const [lost, found, requests, responses] = await Promise.all([
        lostApi.getMy(),
        foundApi.getMy(),
        handoverApi.getMyRequests(),
        handoverApi.getMyResponses(),
      ]);

      setStats({
        lostCount: lost.length,
        foundCount: found.length,
        handoverRequestCount: requests.length,
        handoverResponseCount: responses.length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleLogout = () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffe6e6', 
          color: '#cc0000', 
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          로그인이 필요합니다.
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '30px' }}>
        <button onClick={() => navigate('/dashboard')}>
          ← 대시보드
        </button>
      </div>

      <h1 style={{ marginBottom: '30px' }}>내 프로필</h1>

      {/* 프로필 카드 */}
      <div style={{ 
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        backgroundColor: 'white',
      }}>
        {/* 프로필 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eee',
        }}>
          {/* 아바타 */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: getRoleColor(user.role),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            color: 'white',
            fontWeight: 'bold',
          }}>
            {user.nickname.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
              {user.nickname}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                padding: '4px 12px',
                backgroundColor: getRoleColor(user.role),
                color: 'white',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr',
          gap: '16px',
          marginBottom: '30px',
        }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>사용자 ID</div>
          <div>#{user.id}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>아이디</div>
          <div>{user.username}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>닉네임</div>
          <div>{user.nickname}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>역할</div>
          <div>{getRoleLabel(user.role)}</div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#666',
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 활동 통계 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '16px' }}>내 활동</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {/* 분실 신고 */}
          <StatCard
            title="분실 신고"
            count={stats.lostCount}
            icon="📢"
            color="#0066cc"
            onClick={() => navigate('/lost/list')}
          />

          {/* 습득물 */}
          <StatCard
            title="습득물"
            count={stats.foundCount}
            icon="🎉"
            color="#00cc66"
            onClick={() => navigate('/found/list')}
          />

          {/* 인계 요청 */}
          <StatCard
            title="인계 요청"
            count={stats.handoverRequestCount}
            icon="📨"
            color="#ff9900"
            onClick={() => navigate('/handover/my-requests')}
          />

          {/* 인계 수신 */}
          <StatCard
            title="인계 수신"
            count={stats.handoverResponseCount}
            icon="📬"
            color="#9933ff"
            onClick={() => navigate('/handover/inbox')}
          />
        </div>
      </div>

      {/* 빠른 링크 */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>빠른 링크</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {(user.role === 'LOSER' || user.role === 'ADMIN') && (
            <QuickLink
              title="분실 신고 등록"
              icon="📝"
              onClick={() => navigate('/lost/create')}
            />
          )}
          
          {(user.role === 'FINDER' || user.role === 'OFFICE' || user.role === 'ADMIN') && (
            <QuickLink
              title="습득물 등록"
              icon="📦"
              onClick={() => navigate('/found/create')}
            />
          )}

          <QuickLink
            title="내 인계 목록"
            icon="📋"
            onClick={() => navigate('/handover/my-requests')}
          />

          <QuickLink
            title="인계 수신함"
            icon="📬"
            onClick={() => navigate('/handover/inbox')}
          />
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
  onClick: () => void;
}

function StatCard({ title, count, icon, color, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '24px',
        border: `2px solid ${color}`,
        borderRadius: '12px',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = color;
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.color = '#333';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
        {count}
      </div>
    </div>
  );
}

// 빠른 링크 컴포넌트
interface QuickLinkProps {
  title: string;
  icon: string;
  onClick: () => void;
}

function QuickLink({ title, icon, onClick }: QuickLinkProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
        e.currentTarget.style.borderColor = '#0066cc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.borderColor = '#ddd';
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
        {title}
      </div>
    </button>
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
