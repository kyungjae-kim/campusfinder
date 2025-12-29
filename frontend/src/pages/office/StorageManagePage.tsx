import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundApi } from '@/api/found.api';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, getCategoryLabel } from '@/utils/formatters';

export default function StorageManagePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchStoredItems();
  }, []);

  const fetchStoredItems = async () => {
    try {
      setLoading(true);
      const data = await foundApi.getAll({ page: 0, size: 100 });
      // 보관 중인 습득물 (STORED, IN_HANDOVER)
      setItems((data.content || data).filter((item: FoundItem) =>
        ['STORED', 'IN_HANDOVER'].includes(item.status)
      ));
    } catch (err) {
      console.error('Failed to fetch stored items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'OFFICE') return item.storageType === 'OFFICE';
    if (filter === 'SECURITY') return item.storageType === 'SECURITY';
    if (filter === 'LOCKER') return item.storageType === 'LOCKER';
    return false;
  });

  const getStorageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SELF: '개인 보관',
      OFFICE: '관리실',
      SECURITY: '보안실',
      LOCKER: '보관함',
    };
    return labels[type] || type;
  };

  const getStorageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      OFFICE: 'warning',
      SECURITY: 'danger',
      LOCKER: 'info',
      SELF: 'secondary',
    };
    return colors[type] || 'secondary';
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
            <i className="bi bi-box-seam text-warning me-2"></i>
            보관 관리
            <span className="badge bg-warning ms-2">{items.length}</span>
          </h2>
          <p className="text-muted mb-0">현재 보관 중인 습득물을 관리합니다</p>
        </div>

        {/* 필터 */}
        <ul className="nav nav-pills mb-4">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'OFFICE', label: '관리실 보관', icon: 'bi-building' },
            { key: 'SECURITY', label: '보안실 보관', icon: 'bi-shield-lock' },
            { key: 'LOCKER', label: '보관함', icon: 'bi-inbox' },
          ].map(({ key, label, icon }) => (
            <li key={key} className="nav-item">
              <button
                className={`nav-link ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                <i className={`${icon} me-1`}></i>
                {label}
                <span className="badge bg-light text-dark ms-2">
                  {key === 'ALL' ? items.length :
                   items.filter(i => i.storageType === key).length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* 통계 카드 */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-building fs-2 text-warning d-block mb-2"></i>
                <h4 className="mb-0">{items.filter(i => i.storageType === 'OFFICE').length}</h4>
                <small className="text-muted">관리실</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-lock fs-2 text-danger d-block mb-2"></i>
                <h4 className="mb-0">{items.filter(i => i.storageType === 'SECURITY').length}</h4>
                <small className="text-muted">보안실</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-inbox fs-2 text-info d-block mb-2"></i>
                <h4 className="mb-0">{items.filter(i => i.storageType === 'LOCKER').length}</h4>
                <small className="text-muted">보관함</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-arrow-left-right fs-2 text-primary d-block mb-2"></i>
                <h4 className="mb-0">{items.filter(i => i.status === 'IN_HANDOVER').length}</h4>
                <small className="text-muted">인계 중</small>
              </div>
            </div>
          </div>
        </div>

        {/* 목록 */}
        {filteredItems.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">보관 중인 습득물이 없습니다</h5>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredItems.map((item) => (
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

                    {/* 보관 정보 */}
                    <div className={`alert alert-${getStorageTypeColor(item.storageType)} py-2 px-3 mb-2`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="bi bi-box me-1"></i>
                          <strong>{getStorageTypeLabel(item.storageType)}</strong>
                        </div>
                        {item.status === 'IN_HANDOVER' && (
                          <span className="badge bg-primary">
                            인계 중
                          </span>
                        )}
                      </div>
                      {item.storageLocation && (
                        <div className="small mt-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          {item.storageLocation}
                        </div>
                      )}
                    </div>

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

                    {/* 액션 */}
                    <div className="d-grid">
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
