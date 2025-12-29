import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import { lostApi } from '@/api/lost.api';
import { foundApi } from '@/api/found.api';
import type { Handover } from '@/types/handover.types';
import type { LostItem } from '@/types/lost.types';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

interface EnrichedHandover extends Handover {
  lostItem?: LostItem;
  foundItem?: FoundItem;
}

export default function MyHandoverListPage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<EnrichedHandover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const data = await handoverApi.getMyRequests();
      
      // 각 handover에 대해 lost와 found 정보 가져오기
      const enrichedData = await Promise.all(
        data.map(async (handover) => {
          try {
            const [lostItem, foundItem] = await Promise.all([
              lostApi.getById(handover.lostId).catch(() => null),
              foundApi.getById(handover.foundId).catch(() => null),
            ]);
            return {
              ...handover,
              lostItem,
              foundItem,
            };
          } catch {
            return handover;
          }
        })
      );
      
      setHandovers(enrichedData);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHandovers = handovers.filter(h => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return h.status === 'REQUESTED';
    if (filter === 'IN_PROGRESS') return ['ACCEPTED_BY_FINDER', 'VERIFIED_BY_SECURITY', 'APPROVED_BY_OFFICE', 'SCHEDULED'].includes(h.status);
    return h.status === filter;
  });

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
            <i className="bi bi-send text-primary me-2"></i>
            내 인계 요청
          </h2>
          <p className="text-muted mb-0">내가 요청한 인계 목록을 확인하세요</p>
        </div>

        {/* 필터 */}
        <ul className="nav nav-pills mb-4">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'PENDING', label: '대기중', icon: 'bi-clock' },
            { key: 'IN_PROGRESS', label: '진행중', icon: 'bi-arrow-repeat' },
            { key: 'COMPLETED', label: '완료', icon: 'bi-check-all' },
            { key: 'CANCELED', label: '취소', icon: 'bi-x-circle' },
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
                   key === 'PENDING' ? handovers.filter(h => h.status === 'REQUESTED').length :
                   key === 'IN_PROGRESS' ? handovers.filter(h => ['ACCEPTED_BY_FINDER', 'VERIFIED_BY_SECURITY', 'APPROVED_BY_OFFICE', 'SCHEDULED'].includes(h.status)).length :
                   handovers.filter(h => h.status === key).length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        )}

        {/* 목록 */}
        {filteredHandovers.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">인계 요청이 없습니다</h5>
              <p className="text-muted small">분실물 상세 페이지에서 매칭된 습득물에 인계 요청을 보낼 수 있습니다</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredHandovers.map((handover) => (
              <div key={handover.id} className="col-12">
                <div 
                  className="card shadow-sm border-0 card-hover"
                  onClick={() => navigate(`/handover/${handover.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-9">
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
                          분실물: {handover.lostItem?.title || handover.lostTitle || `#${handover.lostId}`}
                        </h5>

                        {/* 습득물 정보 */}
                        <p className="text-muted mb-2">
                          <i className="bi bi-box me-1"></i>
                          습득물: {handover.foundItem?.title || handover.foundTitle || `#${handover.foundId}`}
                        </p>

                        {/* 응답자 정보 (마스킹) */}
                        <p className="text-muted small mb-2">
                          <i className="bi bi-person me-1"></i>
                          습득자: {handover.responderName || `사용자 #${handover.responderId}`}
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

                        {/* 요청일 */}
                        <small className="text-muted">
                          요청일: {formatDateTime(handover.createdAt)}
                        </small>
                      </div>

                      {/* 액션 */}
                      <div className="col-12 col-md-3">
                        <div className="d-flex align-items-center justify-content-md-end h-100 mt-3 mt-md-0">
                          <button
                            className="btn btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/handover/${handover.id}`);
                            }}
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
