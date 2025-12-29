import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundApi } from '@/api/found.api';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, getCategoryLabel } from '@/utils/formatters';

export default function FoundItemListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'REGISTERED' | 'STORED' | 'IN_HANDOVER' | 'HANDED_OVER'>('ALL');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await foundApi.getMy();
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const getStatusCount = (status: string) => {
    if (status === 'ALL') return items.length;
    return items.filter(item => item.status === status).length;
  };

  const getStorageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SELF: '개인 보관',
      OFFICE: '관리실 보관',
      SECURITY: '보안실 보관',
      LOCKER: '보관함',
    };
    return labels[type] || type;
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
          
          <button 
            className="btn btn-success"
            onClick={() => navigate('/found/create')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            새 습득물 등록
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-check-circle text-success me-2"></i>
            내 습득물
          </h2>
          <p className="text-muted mb-0">등록한 습득물을 관리하세요</p>
        </div>

        {/* 필터 탭 */}
        <ul className="nav nav-pills mb-4 flex-nowrap overflow-auto">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'REGISTERED', label: '등록됨', icon: 'bi-check' },
            { key: 'STORED', label: '보관중', icon: 'bi-box-seam' },
            { key: 'IN_HANDOVER', label: '인계중', icon: 'bi-arrow-left-right' },
            { key: 'HANDED_OVER', label: '인계완료', icon: 'bi-check-all' }
          ].map(({ key, label, icon }) => (
            <li key={key} className="nav-item">
              <button
                className={`nav-link ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key as any)}
              >
                <i className={`${icon} me-1`}></i>
                {label}
                <span className="badge bg-light text-dark ms-2">
                  {getStatusCount(key)}
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
        {filteredItems.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">
                {filter === 'ALL' ? '등록된 습득물이 없습니다.' : `해당 상태의 습득물이 없습니다.`}
              </h5>
              {filter === 'ALL' && (
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/found/create')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  첫 습득물 등록하기
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card shadow-sm border-0 h-100 card-hover"
                  onClick={() => navigate(`/found/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    {/* 카테고리 & 상태 */}
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
                    <div className="alert alert-info py-2 px-3 mb-2">
                      <i className="bi bi-box me-1"></i>
                      <strong>{getStorageTypeLabel(item.storageType)}</strong>
                      {item.storageLocation && (
                        <div className="small mt-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          {item.storageLocation}
                        </div>
                      )}
                    </div>

                    {/* 장소 & 날짜 */}
                    <div className="small text-muted">
                      <div className="mb-1">
                        <i className="bi bi-geo-alt me-1"></i>
                        {item.foundPlace}
                      </div>
                      <div>
                        <i className="bi bi-calendar me-1"></i>
                        {formatDateTime(item.foundAt)}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer bg-transparent border-0 pt-0">
                    <small className="text-muted">
                      등록: {formatDateTime(item.createdAt)}
                    </small>
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
