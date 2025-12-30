import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import type { LostItem } from '@/types/lost.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, formatMoney, getCategoryLabel } from '@/utils/formatters';

export default function LostItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem(parseInt(id));
    }
  }, [id]);

  const fetchItem = async (itemId: number) => {
    try {
      setLoading(true);
      const data = await lostApi.getById(itemId);
      setItem(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    if (!confirm('정말로 이 분실 신고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await lostApi.delete(item.id);
      alert('삭제되었습니다.');
      navigate('/lost/list');
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="alert alert-danger text-center">
                <i className="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                <h5>{error}</h5>
              </div>
              <div className="d-grid">
                <button className="btn btn-primary" onClick={() => navigate('/lost/list')}>
                  <i className="bi bi-arrow-left me-2"></i>
                  목록으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isOwner = currentUser && currentUser.id === item.userId;
    const reward = item.reward;

  return (
    <div className="min-vh-100 bg-light">
      {/* 헤더 */}
      <nav className="navbar navbar-light bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/lost/list')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            목록으로 돌아가기
          </button>

          {isOwner && item.status === 'OPEN' && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(`/lost/${item.id}/edit`)}
              >
                <i className="bi bi-pencil me-2"></i>
                수정
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    삭제
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* 메인 카드 */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                {/* 카테고리 & 상태 */}
                <div className="d-flex gap-2 mb-3">
                  <span className="badge bg-light text-dark fs-6">
                    <i className="bi bi-tag me-1"></i>
                    {getCategoryLabel(item.category)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                {/* 제목 */}
                <h2 className="fw-bold mb-3">
                  {item.title}
                </h2>

                {/* 사례금 */}
                  {reward != null && reward > 0 && (
                      <div className="alert alert-warning d-flex align-items-center mb-4">
                          <i className="bi bi-cash-coin fs-3 me-3"></i>
                          <div>
                              <div className="small text-muted">사례금</div>
                              <div className="fs-4 fw-bold">
                                  {formatMoney(reward)}
                              </div>
                          </div>
                      </div>
                  )}

                {/* 정보 그리드 */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar-event text-primary fs-4 me-3"></i>
                          <div>
                            <small className="text-muted d-block">분실 일시</small>
                            <strong>{formatDateTime(item.lostAt)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt text-danger fs-4 me-3"></i>
                          <div>
                            <small className="text-muted d-block">분실 장소</small>
                            <strong>{item.lostPlace}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-clock text-info fs-4 me-3"></i>
                          <div>
                            <small className="text-muted d-block">등록 일시</small>
                            <strong>{formatDateTime(item.createdAt)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person text-success fs-4 me-3"></i>
                          <div>
                            <small className="text-muted d-block">분실물 ID</small>
                            <strong>#{item.id}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상세 설명 */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-card-text me-2"></i>
                    상세 설명
                  </h5>
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 매칭 후보 찾기 버튼 */}
                {isOwner && item.status === 'OPEN' && (
                  <div className="d-grid">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => navigate(`/matching?lostId=${item.id}`)}
                    >
                      <i className="bi bi-search me-2"></i>
                      매칭 후보 찾기
                    </button>
                    <small className="text-muted text-center mt-2">
                      등록된 습득물 중에서 이 분실물과 유사한 항목을 찾습니다
                    </small>
                  </div>
                )}

                {/* 이미 매칭된 경우 */}
                {item.status === 'MATCHED' && (
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-check-circle fs-4 me-3"></i>
                    <div>
                      <strong>매칭 완료</strong><br />
                      <small>이 분실물은 습득물과 매칭되었습니다. 인계 진행 상황을 확인하세요.</small>
                    </div>
                  </div>
                )}

                {/* 완료된 경우 */}
                {item.status === 'CLOSED' && (
                  <div className="alert alert-success d-flex align-items-center">
                    <i className="bi bi-check-all fs-4 me-3"></i>
                    <div>
                      <strong>인계 완료</strong><br />
                      <small>이 분실물의 인계가 완료되었습니다.</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 추가 액션 카드 */}
            {isOwner && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-gear me-2"></i>
                    관리 옵션
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-12 col-md-4">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => navigate('/handover/my-requests')}
                      >
                        <i className="bi bi-send me-2"></i>
                        내 인계 요청
                      </button>
                    </div>
                    <div className="col-12 col-md-4">
                      <button
                        className="btn btn-outline-info w-100"
                        onClick={() => navigate('/notifications')}
                      >
                        <i className="bi bi-bell me-2"></i>
                        알림 확인
                      </button>
                    </div>
                    <div className="col-12 col-md-4">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => navigate('/lost/list')}
                      >
                        <i className="bi bi-list me-2"></i>
                        내 목록
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
