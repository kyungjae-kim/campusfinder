import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function HandoverInboxPage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const data = await handoverApi.getMyResponses();
      setHandovers(data);
    } catch (err) {
      console.error('Failed to fetch handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id: number, accept: boolean) => {
    try {
      if (accept) {
        await handoverApi.accept(id);
        alert('인계 요청을 승인했습니다.');
      } else {
        await handoverApi.reject(id, '습득자가 거절함');
        alert('인계 요청을 거절했습니다.');
      }
      fetchHandovers();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    }
  };

  const filteredHandovers = handovers.filter(h => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return h.status === 'REQUESTED';
    return h.status === filter;
  });

  const getPendingCount = () => 
    handovers.filter(h => h.status === 'REQUESTED').length;

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
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-inbox text-info me-2"></i>
            인계 수신함
            {getPendingCount() > 0 && (
              <span className="badge bg-danger ms-2">{getPendingCount()}</span>
            )}
          </h2>
          <p className="text-muted mb-0">받은 인계 요청을 확인하고 승인/거절하세요</p>
        </div>

        {/* 필터 */}
        <ul className="nav nav-pills mb-4">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'PENDING', label: '대기중', icon: 'bi-clock' },
            { key: 'ACCEPTED_BY_FINDER', label: '승인됨', icon: 'bi-check-circle' },
            { key: 'COMPLETED', label: '완료', icon: 'bi-check-all' },
          ].map(({ key, label, icon }) => (
            <li key={key} className="nav-item">
              <button
                className={`nav-link ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                <i className={`${icon} me-1`}></i>
                {label}
                <span className="badge bg-light text-dark ms-2">
                  {key === 'ALL' ? handovers.length :
                   key === 'PENDING' ? getPendingCount() :
                   handovers.filter(h => h.status === key).length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* 목록 */}
        {filteredHandovers.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">인계 요청이 없습니다</h5>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredHandovers.map((handover) => (
              <div key={handover.id} className="col-12">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-8">
                        {/* 상태 배지 */}
                        <div className="mb-3">
                          <StatusBadge status={handover.status} />
                          <span className="badge bg-light text-dark ms-2">
                            <i className="bi bi-truck me-1"></i>
                            {handover.method === 'MEET' ? '대면 인계' :
                             handover.method === 'OFFICE' ? '관리실 인계' : '배송 인계'}
                          </span>
                        </div>

                        {/* 분실물 정보 */}
                        <h5 className="card-title mb-2">
                          분실물: {handover.lostTitle || '정보 없음'}
                        </h5>

                        {/* 습득물 정보 */}
                        <p className="text-muted mb-2">
                          <i className="bi bi-box me-1"></i>
                          습득물: {handover.foundTitle || '정보 없음'}
                        </p>

                        {/* 요청자 정보 (마스킹) */}
                        <p className="text-muted small mb-2">
                          <i className="bi bi-person me-1"></i>
                          요청자: {handover.requesterName || '알 수 없음'}
                        </p>

                        {/* 일정 정보 */}
                        {handover.scheduleAt && (
                          <div className="alert alert-info py-2 px-3 mb-2">
                            <i className="bi bi-calendar-event me-1"></i>
                            <strong>일정:</strong> {formatDateTime(handover.scheduleAt)}
                            {handover.meetPlace && (
                              <div className="mt-1">
                                <i className="bi bi-geo-alt me-1"></i>
                                {handover.meetPlace}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 생성일 */}
                        <small className="text-muted">
                          요청일: {formatDateTime(handover.createdAt)}
                        </small>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="col-12 col-md-4">
                        <div className="d-flex flex-column gap-2 h-100 justify-content-center">
                          {handover.status === 'REQUESTED' && (
                            <>
                              <button
                                className="btn btn-success"
                                onClick={() => handleResponse(handover.id, true)}
                              >
                                <i className="bi bi-check-circle me-2"></i>
                                승인
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleResponse(handover.id, false)}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                거절
                              </button>
                            </>
                          )}
                          
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/handover/${handover.id}`)}
                          >
                            <i className="bi bi-eye me-2"></i>
                            상세보기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
