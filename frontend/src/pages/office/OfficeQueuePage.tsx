import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundApi } from '@/api/found.api';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, getCategoryLabel } from '@/utils/formatters';

export default function OfficeQueuePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      // 관리실에서 처리할 습득물 목록 (REGISTERED 상태)
      const data = await foundApi.getAll({ page: 0, size: 100 });
      setItems((data.content || data).filter((item: FoundItem) => item.status === 'REGISTERED'));
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await foundApi.updateStatus(id, 'STORED');
      alert('보관 처리되었습니다.');
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
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
            <i className="bi bi-clock-history text-warning me-2"></i>
            접수 대기 목록
            {items.length > 0 && (
              <span className="badge bg-warning ms-2">{items.length}</span>
            )}
          </h2>
          <p className="text-muted mb-0">새로 등록된 습득물을 보관 처리하세요</p>
        </div>

        {/* 목록 */}
        {items.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-check-circle fs-1 text-success d-block mb-3"></i>
              <h5 className="text-success mb-3">처리할 항목이 없습니다</h5>
              <p className="text-muted small">모든 습득물이 처리되었습니다</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {items.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    {/* 배지 */}
                    <div className="d-flex gap-2 mb-3">
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-tag me-1"></i>
                        {getCategoryLabel(item.category)}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    {/* 제목 */}
                    <h5 className="card-title mb-2 text-truncate-1">
                      {item.title}
                    </h5>

                    {/* 설명 */}
                    <p className="card-text text-muted small mb-3 text-truncate-2">
                      {item.description}
                    </p>

                    {/* 습득 정보 */}
                    <div className="small text-muted mb-3">
                      <div className="mb-1">
                        <i className="bi bi-geo-alt me-1"></i>
                        {item.foundPlace}
                      </div>
                      <div>
                        <i className="bi bi-calendar me-1"></i>
                        {formatDateTime(item.foundAt)}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleAccept(item.id)}
                      >
                        <i className="bi bi-box-seam me-2"></i>
                        보관 처리
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/found/${item.id}`)}
                      >
                        <i className="bi bi-eye me-2"></i>
                        상세보기
                      </button>
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
