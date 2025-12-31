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

export default function SecurityInspectionPage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<EnrichedHandover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspectionQueue();
  }, []);

  const fetchInspectionQueue = async () => {
    try {
      setLoading(true);
      // 보안 검수 대기 중인 인계 목록
      const data = await handoverApi.getAll({ page: 0, size: 100 });
      const filtered = data.filter((h: Handover) => h.status === 'ACCEPTED_BY_FINDER');
      
      // 각 handover에 대해 lost와 found 정보 가져오기
      const enrichedData = await Promise.all(
        filtered.map(async (handover) => {
          try {
            const [lostItem, foundItem] = await Promise.all([
              lostApi.getById(handover.lostId).catch(() => undefined),
              foundApi.getById(handover.foundId).catch(() => undefined),
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
    } catch (err) {
      console.error('Failed to fetch inspection queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await handoverApi.securityVerify(id);
      alert('검수가 승인되었습니다.');
      fetchInspectionQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-vh-100 bg-light">

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-search text-purple me-2" style={{ color: '#9933ff' }}></i>
            보안 검수 목록
            {handovers.length > 0 && (
              <span className="badge ms-2" style={{ backgroundColor: '#9933ff' }}>{handovers.length}</span>
            )}
          </h2>
          <p className="text-muted mb-0">전자기기, 지갑, 신분증 등 고가품 검수</p>
        </div>

        {/* 안내 메시지 */}
        <div className="alert alert-warning d-flex align-items-start mb-4" role="alert">
          <i className="bi bi-shield-exclamation me-2 flex-shrink-0"></i>
          <div className="small">
            <strong>검수 안내</strong><br />
            전자기기, 지갑, 신분증 카테고리는 보안 검수가 필수입니다.
            검수 승인 후 관리실에서 최종 승인이 진행됩니다.
          </div>
        </div>

        {/* 목록 */}
        {handovers.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-check-circle fs-1 text-success d-block mb-3"></i>
              <h5 className="text-success mb-3">검수할 항목이 없습니다</h5>
              <p className="text-muted small">모든 검수가 완료되었습니다</p>
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
                          <span className="badge bg-warning ms-2">
                            <i className="bi bi-shield-exclamation me-1"></i>
                            검수 필요
                          </span>
                        </div>

                        {/* 정보 */}
                        <h5 className="card-title mb-2">
                          분실물: {handover.lostItem?.title || handover.lostTitle || `#${handover.lostId}`}
                        </h5>
                        <p className="text-muted mb-2">
                          <i className="bi bi-box me-1"></i>
                          습득물: {handover.foundItem?.title || handover.foundTitle || `#${handover.foundId}`}
                        </p>

                        {/* 카테고리 경고 */}
                        {handover.foundItem && (
                          <div className="alert alert-danger py-2 px-3 mb-2">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            <strong>카테고리: {handover.foundItem.category}</strong> - 고가품/위험물 검수 필요
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
                            onClick={() => handleVerify(handover.id)}
                          >
                            <i className="bi bi-shield-check me-2"></i>
                            검수 승인
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
