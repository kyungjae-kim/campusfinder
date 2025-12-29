import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function ApprovalManagePage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const fetchApprovalQueue = async () => {
    try {
      setLoading(true);
      // 보안 승인 대기중인 인계 목록
      const data = await handoverApi.getAll({ page: 0, size: 100 });
      setHandovers(data.filter((h: Handover) => 
        h.status === 'VERIFIED_BY_SECURITY' || h.status === 'ACCEPTED_BY_FINDER'
      ));
    } catch (err) {
      console.error('Failed to fetch approval queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await handoverApi.officeApprove(id);
      alert('인계가 승인되었습니다.');
      fetchApprovalQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || '승인에 실패했습니다.');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('거절 사유를 입력하세요:');
    if (!reason) return;

    try {
      await handoverApi.reject(id, reason);
      alert('인계가 거절되었습니다.');
      fetchApprovalQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || '거절에 실패했습니다.');
    }
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
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-check-square text-purple me-2" style={{ color: '#9933ff' }}></i>
            승인 관리
            {handovers.length > 0 && (
              <span className="badge ms-2" style={{ backgroundColor: '#9933ff' }}>{handovers.length}</span>
            )}
          </h2>
          <p className="text-muted mb-0">검수 완료된 인계 요청을 최종 승인합니다</p>
        </div>

        {/* 안내 메시지 */}
        <div className="alert alert-info d-flex align-items-start mb-4" role="alert">
          <i className="bi bi-info-circle me-2 flex-shrink-0"></i>
          <div className="small">
            <strong>승인 절차 안내</strong><br />
            보안 검수가 완료된 인계 요청을 최종 승인합니다.
            승인 시 양측의 연락처가 공개되며 인계 일정을 잡을 수 있습니다.
          </div>
        </div>

        {/* 목록 */}
        {handovers.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-check-circle fs-1 text-success d-block mb-3"></i>
              <h5 className="text-success mb-3">승인할 항목이 없습니다</h5>
              <p className="text-muted small">모든 인계 요청이 처리되었습니다</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {handovers.map((handover) => (
              <div key={handover.id} className="col-12">
                <div className="card shadow-sm border-0 border-start border-4" style={{ borderColor: '#9933ff !important' }}>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-8">
                        {/* 상태 */}
                        <div className="mb-3">
                          <StatusBadge status={handover.status} />
                          <span className="badge bg-light text-dark ms-2">
                            <i className="bi bi-truck me-1"></i>
                            {handover.method === 'MEET' ? '대면 인계' :
                             handover.method === 'OFFICE' ? '관리실 인계' : '배송 인계'}
                          </span>
                          {handover.status === 'VERIFIED_BY_SECURITY' && (
                            <span className="badge bg-success ms-2">
                              <i className="bi bi-shield-check me-1"></i>
                              검수 완료
                            </span>
                          )}
                        </div>

                        {/* 정보 */}
                        <h5 className="card-title mb-2">
                          분실물: {handover.lostTitle || '정보 없음'}
                        </h5>
                        <p className="text-muted mb-2">
                          <i className="bi bi-box me-1"></i>
                          습득물: {handover.foundTitle || '정보 없음'}
                        </p>

                        {/* 당사자 정보 */}
                        <div className="alert alert-light py-2 px-3 mb-2">
                          <div className="row">
                            <div className="col-6">
                              <small className="text-muted d-block">요청자 (분실자)</small>
                              <strong>{handover.requesterName || '알 수 없음'}</strong>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">응답자 (습득자)</small>
                              <strong>{handover.responderName || '알 수 없음'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* 일정 정보 */}
                        {handover.scheduleAt && (
                          <div className="alert alert-info py-2 px-3 mb-2">
                            <i className="bi bi-calendar-event me-1"></i>
                            <strong>예정 일정:</strong> {formatDateTime(handover.scheduleAt)}
                            {handover.meetPlace && (
                              <div className="mt-1">
                                <i className="bi bi-geo-alt me-1"></i>
                                {handover.meetPlace}
                              </div>
                            )}
                          </div>
                        )}

                        <small className="text-muted">
                          요청일: {formatDateTime(handover.createdAt)}
                        </small>
                      </div>

                      {/* 액션 */}
                      <div className="col-12 col-md-4">
                        <div className="d-flex flex-column gap-2 h-100 justify-content-center">
                          <button
                            className="btn text-white"
                            style={{ backgroundColor: '#9933ff' }}
                            onClick={() => handleApprove(handover.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            최종 승인
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleReject(handover.id)}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            거절
                          </button>
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
