import { useState, useEffect, useCallback } from 'react';
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

  const loadProfile = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [loadProfile, loadStats]);

  const handleLogout = () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="alert alert-danger text-center">
                <i className="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                <h5>로그인이 필요합니다</h5>
                <p className="mb-0">프로필을 보려면 먼저 로그인해주세요.</p>
              </div>
              <div className="d-grid">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* 헤더 */}
      <nav className="navbar navbar-light bg-white shadow-sm mb-4">
        <div className="container">
          <button className="btn btn-link text-decoration-none" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            대시보드로 돌아가기
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <h2 className="mb-4 fw-bold">
          <i className="bi bi-person-circle me-2"></i>
          내 프로필
        </h2>

        {/* 프로필 카드 */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            {/* 프로필 헤더 */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
              {/* 아바타 */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '36px',
                  backgroundColor: getRoleColor(user.role),
                }}
              >
                {user.nickname.charAt(0).toUpperCase()}
              </div>

              <div className="flex-grow-1">
                <h3 className="mb-2">{user.nickname}</h3>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{ backgroundColor: getRoleColor(user.role) }}
                >
                  <i className={`bi ${getRoleIcon(user.role)} me-1`}></i>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center">
                  <i className="bi bi-hash text-muted me-2"></i>
                  <div>
                    <small className="text-muted d-block">사용자 ID</small>
                    <strong>#{user.id}</strong>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center">
                  <i className="bi bi-person text-muted me-2"></i>
                  <div>
                    <small className="text-muted d-block">아이디</small>
                    <strong>{user.username}</strong>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center">
                  <i className="bi bi-tag text-muted me-2"></i>
                  <div>
                    <small className="text-muted d-block">닉네임</small>
                    <strong>{user.nickname}</strong>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center">
                  <i className="bi bi-briefcase text-muted me-2"></i>
                  <div>
                    <small className="text-muted d-block">역할</small>
                    <strong>{getRoleLabel(user.role)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <div className="d-grid">
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 활동 통계 */}
        <h4 className="mb-3 fw-bold">
          <i className="bi bi-bar-chart me-2"></i>
          내 활동 통계
        </h4>
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatCard
              title="분실 신고"
              count={stats.lostCount}
              icon="bi-exclamation-circle"
              color="#0066cc"
              onClick={() => navigate('/lost/list')}
            />
          </div>

          <div className="col-6 col-md-3">
            <StatCard
              title="습득물"
              count={stats.foundCount}
              icon="bi-check-circle"
              color="#00cc66"
              onClick={() => navigate('/found/list')}
            />
          </div>

          <div className="col-6 col-md-3">
            <StatCard
              title="인계 요청"
              count={stats.handoverRequestCount}
              icon="bi-send"
              color="#ff9900"
              onClick={() => navigate('/handover/my-requests')}
            />
          </div>

          <div className="col-6 col-md-3">
            <StatCard
              title="인계 수신"
              count={stats.handoverResponseCount}
              icon="bi-inbox"
              color="#9933ff"
              onClick={() => navigate('/handover/inbox')}
            />
          </div>
        </div>

        {/* 빠른 링크 */}
        <h4 className="mb-3 fw-bold">
          <i className="bi bi-lightning me-2"></i>
          빠른 링크
        </h4>
        <div className="row g-3">
          {/* 분실 신고 등록 - LOSER, ADMIN */}
          {(user.role === 'LOSER' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="분실 신고 등록"
                icon="bi-plus-circle"
                onClick={() => navigate('/lost/create')}
              />
            </div>
          )}

          {/* 습득물 등록 - FINDER, OFFICE, ADMIN */}
          {(user.role === 'FINDER' || user.role === 'OFFICE' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="습득물 등록"
                icon="bi-plus-square"
                onClick={() => navigate('/found/create')}
              />
            </div>
          )}

          {/* 내 인계 목록 - LOSER, FINDER */}
          {(user.role === 'LOSER' || user.role === 'FINDER') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="내 인계 목록"
                icon="bi-list-ul"
                onClick={() => navigate('/handover/my-requests')}
              />
            </div>
          )}

          {/* 인계 수신함 - FINDER */}
          {user.role === 'FINDER' && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="인계 수신함"
                icon="bi-inbox"
                onClick={() => navigate('/handover/inbox')}
              />
            </div>
          )}

          {/* 관리실 대기열 - OFFICE, ADMIN */}
          {(user.role === 'OFFICE' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="관리실 대기열"
                icon="bi-hourglass-split"
                onClick={() => navigate('/office/queue')}
              />
            </div>
          )}

          {/* 보관 관리 - OFFICE, ADMIN */}
          {(user.role === 'OFFICE' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="보관 관리"
                icon="bi-box-seam"
                onClick={() => navigate('/office/storage')}
              />
            </div>
          )}

          {/* 보안 검수 - SECURITY, ADMIN */}
          {(user.role === 'SECURITY' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="보안 검수"
                icon="bi-shield-check"
                onClick={() => navigate('/security/inspection')}
              />
            </div>
          )}

          {/* 승인 관리 - SECURITY, ADMIN */}
          {(user.role === 'SECURITY' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="승인 관리"
                icon="bi-check-square"
                onClick={() => navigate('/security/approval')}
              />
            </div>
          )}

          {/* 신고 관리 - ADMIN, OFFICE, SECURITY */}
          {(user.role === 'ADMIN' || user.role === 'OFFICE' || user.role === 'SECURITY') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="신고 관리"
                icon="bi-flag"
                onClick={() => navigate('/admin/reports')}
              />
            </div>
          )}

          {/* 사용자 관리 - ADMIN */}
          {user.role === 'ADMIN' && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="사용자 관리"
                icon="bi-people"
                onClick={() => navigate('/admin/users')}
              />
            </div>
          )}

          {/* 운영 통계 - ADMIN */}
          {user.role === 'ADMIN' && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="운영 통계"
                icon="bi-bar-chart"
                onClick={() => navigate('/admin/statistics')}
              />
            </div>
          )}

          {/* 배송 관리 - COURIER, ADMIN */}
          {(user.role === 'COURIER' || user.role === 'ADMIN') && (
            <div className="col-6 col-md-3">
              <QuickLink
                title="배송 관리"
                icon="bi-truck"
                onClick={() => navigate('/courier/delivery')}
              />
            </div>
          )}
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
      className="card h-100 border-2 card-hover"
      style={{ borderColor: color, cursor: 'pointer' }}
      onClick={onClick}
    >
      <div className="card-body text-center">
        <i className={`${icon} fs-1 mb-3 d-block`} style={{ color }}></i>
        <p className="text-muted small mb-2">{title}</p>
        <h2 className="fw-bold mb-0">{count}</h2>
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
    <div className="card h-100 card-hover" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-body text-center">
        <i className={`${icon} fs-2 mb-2 d-block text-primary`}></i>
        <p className="fw-semibold mb-0 small">{title}</p>
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

// 역할별 아이콘
function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    LOSER: 'bi-exclamation-circle',
    FINDER: 'bi-check-circle',
    OFFICE: 'bi-building',
    SECURITY: 'bi-shield-lock',
    ADMIN: 'bi-shield-check',
    COURIER: 'bi-truck',
  };
  return icons[role] || 'bi-person';
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
