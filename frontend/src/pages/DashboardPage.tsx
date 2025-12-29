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
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* 헤더 */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-search me-2"></i>
            캠퍼스 분실물 플랫폼
          </span>

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

            {/* 사용자 정보 */}
            <div className="dropdown">
              <button
                className="btn btn-light d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold badge-${user.role.toLowerCase()}`}
                     style={{ width: '32px', height: '32px' }}>
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

      {/* 메인 콘텐츠 */}
      <div className="container py-4">
        <div className="row g-4">
          {/* 분실자 메뉴 */}
          {(user.role === 'LOSER' || user.role === 'ADMIN') && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 card-hover border-primary">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-exclamation-circle text-primary me-2"></i>
                    분실 신고
                  </h5>
                  <p className="card-text text-muted small">
                    분실물을 신고하고 매칭 후보를 확인하세요
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/lost/create')}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      분실 신고 등록
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/lost/list')}
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      내 분실 신고 목록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 습득자 메뉴 */}
          {(user.role === 'FINDER' || user.role === 'OFFICE' || user.role === 'ADMIN') && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 card-hover border-success">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    습득물
                  </h5>
                  <p className="card-text text-muted small">
                    습득물을 등록하고 관리하세요
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => navigate('/found/create')}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      습득물 등록
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={() => navigate('/found/list')}
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      내 습득물 목록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 인계 메뉴 (COURIER 제외) */}
          {user.role !== 'COURIER' && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 card-hover border-info">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-arrow-left-right text-info me-2"></i>
                    인계 관리
                  </h5>
                  <p className="card-text text-muted small">
                    인계 요청을 확인하고 처리하세요
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-info text-white"
                      onClick={() => navigate('/handover/my-requests')}
                    >
                      <i className="bi bi-send me-2"></i>
                      내 인계 요청
                    </button>
                    <button
                      className="btn btn-outline-info"
                      onClick={() => navigate('/handover/inbox')}
                    >
                      <i className="bi bi-inbox me-2"></i>
                      인계 수신함
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 관리자 메뉴 */}
          {user.role === 'ADMIN' && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 card-hover border-danger">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-shield-check text-danger me-2"></i>
                    관리자
                  </h5>
                  <p className="card-text text-muted small">
                    신고 처리 및 시스템 관리
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={() => navigate('/admin/reports')}
                    >
                      <i className="bi bi-flag me-2"></i>
                      신고 관리
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => navigate('/admin/users')}
                    >
                      <i className="bi bi-people me-2"></i>
                      사용자 관리
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => navigate('/admin/statistics')}
                    >
                      <i className="bi bi-bar-chart me-2"></i>
                      운영 통계
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 관리실 메뉴 */}
          {user.role === 'OFFICE' && (
            <>
              <div className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 card-hover border-warning">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-building text-warning me-2"></i>
                      관리실
                    </h5>
                    <p className="card-text text-muted small">
                      접수 대기 및 보관 관리
                    </p>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-warning"
                        onClick={() => navigate('/office/queue')}
                      >
                        <i className="bi bi-clock-history me-2"></i>
                        접수 대기 목록
                      </button>
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => navigate('/office/storage')}
                      >
                        <i className="bi bi-box-seam me-2"></i>
                        보관 관리
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 card-hover border-warning">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-check-square text-warning me-2"></i>
                      인계 승인 관리
                    </h5>
                    <p className="card-text text-muted small">
                      검수 완료된 인계 요청 최종 승인
                    </p>
                    <div className="d-grid">
                      <button
                        className="btn btn-warning"
                        onClick={() => navigate('/security/approval')}
                      >
                        <i className="bi bi-check-square me-2"></i>
                        승인 관리
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 보안 메뉴 */}
          {user.role === 'SECURITY' && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 card-hover" style={{ borderColor: '#9933ff' }}>
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-shield-lock me-2" style={{ color: '#9933ff' }}></i>
                    보안
                  </h5>
                  <p className="card-text text-muted small">
                    고가품 검수 관리
                  </p>
                  <div className="d-grid">
                    <button
                      className="btn text-white"
                      style={{ backgroundColor: '#9933ff' }}
                      onClick={() => navigate('/security/inspection')}
                    >
                      <i className="bi bi-search me-2"></i>
                      검수 목록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 배송 메뉴 (COURIER) */}
          {user.role === 'COURIER' && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 card-hover" style={{ borderColor: '#00cccc' }}>
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-truck me-2" style={{ color: '#00cccc' }}></i>
                    배송 관리
                  </h5>
                  <p className="card-text text-muted small">
                    배송 방식 인계 건의 상태를 관리합니다
                    <br/>
                    <small>(픽업 → 이동중 → 전달완료)</small>
                  </p>
                  <div className="d-grid">
                    <button
                      className="btn text-white"
                      style={{ backgroundColor: '#00cccc' }}
                      onClick={() => navigate('/courier/delivery')}
                    >
                      <i className="bi bi-box-seam me-2"></i>
                      배송 목록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
