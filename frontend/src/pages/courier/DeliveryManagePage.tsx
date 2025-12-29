import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function DeliveryManagePage() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // COURIER 방식의 인계 목록
      const data = await handoverApi.getAll({ page: 0, size: 100 });
      setDeliveries(data.filter((h: Handover) => h.method === 'COURIER'));
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await handoverApi.updateCourierStatus(id, status);
      alert('상태가 업데이트되었습니다.');
      fetchDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return d.courierStatus === 'PENDING';
    if (filter === 'IN_TRANSIT') return d.courierStatus === 'IN_TRANSIT';
    return d.courierStatus === filter;
  });

  const getDeliveryStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '픽업 대기',
      PICKED_UP: '픽업 완료',
      IN_TRANSIT: '배송 중',
      DELIVERED: '배송 완료',
    };
    return labels[status] || status;
  };

  const getDeliveryStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'warning',
      PICKED_UP: 'info',
      IN_TRANSIT: 'primary',
      DELIVERED: 'success',
    };
    return colors[status] || 'secondary';
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
            <i className="bi bi-truck text-info me-2"></i>
            배송 관리
          </h2>
          <p className="text-muted mb-0">배송 방식 인계 건의 상태를 관리합니다</p>
        </div>

        {/* 필터 */}
        <ul className="nav nav-pills mb-4">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'PENDING', label: '픽업 대기', icon: 'bi-clock' },
            { key: 'PICKED_UP', label: '픽업 완료', icon: 'bi-box-seam' },
            { key: 'IN_TRANSIT', label: '배송 중', icon: 'bi-truck' },
            { key: 'DELIVERED', label: '배송 완료', icon: 'bi-check-circle' },
          ].map(({ key, label, icon }) => (
            <li key={key} className="nav-item">
              <button
                className={`nav-link ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                <i className={`${icon} me-1`}></i>
                {label}
                <span className="badge bg-light text-dark ms-2">
                  {key === 'ALL' ? deliveries.length :
                   deliveries.filter(d => d.courierStatus === key).length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* 안내 메시지 */}
        <div className="alert alert-info d-flex align-items-start mb-4" role="alert">
          <i className="bi bi-info-circle me-2 flex-shrink-0"></i>
          <div className="small">
            <strong>배송 단계</strong><br />
            픽업 대기 → 픽업 완료 → 배송 중 → 배송 완료 순서로 진행됩니다.
            각 단계별로 상태를 업데이트해주세요.
          </div>
        </div>

        {/* 목록 */}
        {filteredDeliveries.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">배송 건이 없습니다</h5>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="col-12">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-8">
                        {/* 배송 상태 */}
                        <div className="mb-3">
                          <span className={`badge bg-${getDeliveryStatusColor(delivery.courierStatus || 'PENDING')}`}>
                            <i className="bi bi-truck me-1"></i>
                            {getDeliveryStatusLabel(delivery.courierStatus || 'PENDING')}
                          </span>
                          <StatusBadge status={delivery.status} />
                          {' '}
                        </div>

                        {/* 정보 */}
                        <h5 className="card-title mb-2">
                          분실물: {delivery.lostTitle || '정보 없음'}
                        </h5>
                        <p className="text-muted mb-2">
                          <i className="bi bi-box me-1"></i>
                          습득물: {delivery.foundTitle || '정보 없음'}
                        </p>

                        {/* 주소 정보 */}
                        {delivery.deliveryAddress && (
                          <div className="alert alert-light py-2 px-3 mb-2">
                            <i className="bi bi-geo-alt me-1"></i>
                            <strong>배송 주소:</strong> {delivery.deliveryAddress}
                          </div>
                        )}

                        <small className="text-muted">
                          요청일: {formatDateTime(delivery.createdAt)}
                        </small>
                      </div>

                      {/* 액션 */}
                      <div className="col-12 col-md-4">
                        <div className="d-flex flex-column gap-2 h-100 justify-content-center">
                          {delivery.courierStatus === 'PENDING' && (
                            <button
                              className="btn btn-warning"
                              onClick={() => handleUpdateStatus(delivery.id, 'PICKED_UP')}
                            >
                              <i className="bi bi-box-seam me-2"></i>
                              픽업 완료
                            </button>
                          )}
                          {delivery.courierStatus === 'PICKED_UP' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleUpdateStatus(delivery.id, 'IN_TRANSIT')}
                            >
                              <i className="bi bi-truck me-2"></i>
                              배송 시작
                            </button>
                          )}
                          {delivery.courierStatus === 'IN_TRANSIT' && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleUpdateStatus(delivery.id, 'DELIVERED')}
                            >
                              <i className="bi bi-check-circle me-2"></i>
                              배송 완료
                            </button>
                          )}
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/handover/${delivery.id}`)}
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
