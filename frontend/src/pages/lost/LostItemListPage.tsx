import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import type { LostItem } from '@/types/lost.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, formatMoney, getCategoryLabel } from '@/utils/formatters';

export default function LostItemListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'MATCHED' | 'CLOSED'>('ALL');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await lostApi.getMy();
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

  if (loading) return <Loading />;

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        {/* 타이틀 */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2">
              <i className="bi bi-exclamation-circle text-primary me-2"></i>
              내 분실 신고
            </h2>
            <p className="text-muted mb-0">등록한 분실물 신고를 관리하세요</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/lost/create')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            새 분실 신고
          </button>
        </div>

        {/* 필터 탭 */}
        <ul className="nav nav-pills mb-4">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'OPEN', label: '진행중', icon: 'bi-hourglass-split' },
            { key: 'MATCHED', label: '매칭됨', icon: 'bi-check-circle' },
            { key: 'CLOSED', label: '완료', icon: 'bi-check-all' }
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
                {filter === 'ALL' ? '등록된 분실 신고가 없습니다.' : `${
                  filter === 'OPEN' ? '진행중인' : 
                  filter === 'MATCHED' ? '매칭된' : '완료된'
                } 분실 신고가 없습니다.`}
              </h5>
              {filter === 'ALL' && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/lost/create')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  첫 분실 신고 등록하기
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="col-12">
                <div 
                  className="card shadow-sm border-0 card-hover"
                  onClick={() => navigate(`/lost/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-8">
                        {/* 카테고리 & 상태 */}
                        <div className="d-flex gap-2 mb-2">
                          <span className="badge bg-light text-dark">
                            <i className="bi bi-tag me-1"></i>
                            {getCategoryLabel(item.category)}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>

                        {/* 제목 */}
                        <h5 className="card-title mb-2">
                          {item.title}
                        </h5>

                        {/* 설명 */}
                        <p className="card-text text-muted small mb-2 text-truncate-2">
                          {item.description}
                        </p>

                        {/* 장소 & 날짜 */}
                        <div className="d-flex gap-3 small text-muted">
                          <span>
                            <i className="bi bi-geo-alt me-1"></i>
                            {item.lostPlace}
                          </span>
                          <span>
                            <i className="bi bi-calendar me-1"></i>
                            {formatDateTime(item.lostAt)}
                          </span>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="d-flex flex-column h-100 justify-content-between align-items-md-end mt-3 mt-md-0">
                          {/* 사례금 */}
                          {item.reward != null && item.reward > 0  && (
                            <div className="alert alert-warning py-2 px-3 mb-2">
                              <i className="bi bi-cash-coin me-1"></i>
                              <strong>{formatMoney(item.reward)}</strong>
                            </div>
                          )}

                          {/* 등록일 */}
                          <small className="text-muted">
                            등록: {formatDateTime(item.createdAt)}
                          </small>
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
