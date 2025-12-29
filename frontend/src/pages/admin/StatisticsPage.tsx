import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import Loading from '@/components/common/Loading';

interface Statistics {
  lostCount: number;
  foundCount: number;
  handoverCount: number;
  completedHandoverCount: number;
  pendingReportCount: number;
  activeUserCount: number;
}

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStatistics(period);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!stats) return <div>통계를 불러올 수 없습니다.</div>;

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
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-bar-chart text-danger me-2"></i>
            운영 통계
          </h2>
          <p className="text-muted mb-0">플랫폼의 운영 현황을 확인하세요</p>
        </div>

        {/* 기간 선택 */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-calendar-range me-2"></i>
                조회 기간
              </h5>
              <div className="btn-group" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="period"
                  id="week"
                  checked={period === 'week'}
                  onChange={() => setPeriod('week')}
                />
                <label className="btn btn-outline-primary" htmlFor="week">
                  최근 7일
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="period"
                  id="month"
                  checked={period === 'month'}
                  onChange={() => setPeriod('month')}
                />
                <label className="btn btn-outline-primary" htmlFor="month">
                  최근 30일
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="period"
                  id="year"
                  checked={period === 'year'}
                  onChange={() => setPeriod('year')}
                />
                <label className="btn btn-outline-primary" htmlFor="year">
                  최근 1년
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="row g-4 mb-4">
          {/* 분실 신고 */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 border-start border-primary border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1">분실 신고</p>
                    <h2 className="fw-bold mb-0">{stats.lostCount}</h2>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-exclamation-circle fs-3 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 습득물 등록 */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 border-start border-success border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1">습득물 등록</p>
                    <h2 className="fw-bold mb-0">{stats.foundCount}</h2>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-check-circle fs-3 text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 인계 요청 */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 border-start border-warning border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1">인계 요청</p>
                    <h2 className="fw-bold mb-0">{stats.handoverCount}</h2>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-arrow-left-right fs-3 text-warning"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 인계 완료 */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 border-start border-info border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1">인계 완료</p>
                    <h2 className="fw-bold mb-0">{stats.completedHandoverCount}</h2>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-check-all fs-3 text-info"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 통계 */}
        <div className="row g-4">
          {/* 성공률 */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-trophy me-2"></i>
                  인계 성공률
                </h5>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="progress" style={{ height: '30px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{
                          width: `${stats.handoverCount > 0 
                            ? (stats.completedHandoverCount / stats.handoverCount * 100) 
                            : 0}%`
                        }}
                      >
                        <strong>
                          {stats.handoverCount > 0 
                            ? Math.round(stats.completedHandoverCount / stats.handoverCount * 100) 
                            : 0}%
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="ms-3">
                    <h3 className="mb-0 fw-bold">
                      {stats.handoverCount > 0 
                        ? Math.round(stats.completedHandoverCount / stats.handoverCount * 100) 
                        : 0}%
                    </h3>
                  </div>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  {stats.completedHandoverCount}건 완료 / {stats.handoverCount}건 요청
                </p>
              </div>
            </div>
          </div>

          {/* 대기중인 신고 */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-flag me-2"></i>
                  처리 대기중인 신고
                </h5>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    {stats.pendingReportCount > 0 ? (
                      <div className="alert alert-warning mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>{stats.pendingReportCount}건</strong>의 신고가 대기중입니다.
                      </div>
                    ) : (
                      <div className="alert alert-success mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        모든 신고가 처리되었습니다.
                      </div>
                    )}
                  </div>
                </div>
                {stats.pendingReportCount > 0 && (
                  <button
                    className="btn btn-outline-warning w-100 mt-3"
                    onClick={() => navigate('/admin/reports')}
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    신고 관리로 이동
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 활성 사용자 */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-people me-2"></i>
                  활성 사용자
                </h5>
                <div className="row g-3">
                  <div className="col-auto">
                    <div className="bg-primary bg-opacity-10 p-4 rounded text-center">
                      <h2 className="fw-bold mb-1 text-primary">{stats.activeUserCount}</h2>
                      <p className="text-muted small mb-0">명</p>
                    </div>
                  </div>
                  <div className="col">
                    <p className="text-muted mb-2">
                      최근 {period === 'week' ? '7일' : period === 'month' ? '30일' : '1년'} 동안 활동한 사용자 수
                    </p>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/admin/users')}
                    >
                      <i className="bi bi-people me-2"></i>
                      사용자 관리로 이동
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
