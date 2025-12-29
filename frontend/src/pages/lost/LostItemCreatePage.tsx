import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import type { LostItemCreateRequest } from '@/types/lost.types';
import { CATEGORIES } from '@/utils/constants';

export default function LostItemCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LostItemCreateRequest>({
    category: '',
    title: '',
    description: '',
    lostAt: '',
    lostPlace: '',
    reward: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title || !formData.description || !formData.lostAt || !formData.lostPlace) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await lostApi.create(formData);
      alert('분실 신고가 등록되었습니다!');
      navigate(`/lost/${response.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
        </div>
      </nav>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* 타이틀 */}
            <div className="mb-4">
              <h2 className="fw-bold mb-2">
                <i className="bi bi-plus-circle text-primary me-2"></i>
                분실물 신고 등록
              </h2>
              <p className="text-muted mb-0">분실한 물건의 정보를 상세히 입력해주세요</p>
            </div>

            {/* 폼 */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* 카테고리 */}
                  <div className="mb-4">
                    <label htmlFor="category" className="form-label fw-semibold">
                      <i className="bi bi-tag me-2"></i>
                      카테고리 *
                    </label>
                    <select
                      id="category"
                      className="form-select form-select-lg"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">카테고리를 선택하세요</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 제목 */}
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-semibold">
                      <i className="bi bi-pencil me-2"></i>
                      제목 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="form-control form-control-lg"
                      placeholder="예: 검은색 지갑을 잃어버렸습니다"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* 설명 */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold">
                      <i className="bi bi-card-text me-2"></i>
                      상세 설명 *
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows={5}
                      placeholder="분실물의 특징을 자세히 적어주세요 (색상, 브랜드, 크기 등)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                    <div className="form-text">
                      자세한 설명은 매칭 정확도를 높이는 데 도움이 됩니다.
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    {/* 분실 장소 */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="lostPlace" className="form-label fw-semibold">
                        <i className="bi bi-geo-alt me-2"></i>
                        분실 장소 *
                      </label>
                      <input
                        type="text"
                        id="lostPlace"
                        className="form-control"
                        placeholder="예: 중앙도서관 3층"
                        value={formData.lostPlace}
                        onChange={(e) => setFormData({ ...formData, lostPlace: e.target.value })}
                        required
                      />
                    </div>

                    {/* 분실 날짜/시간 */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="lostAt" className="form-label fw-semibold">
                        <i className="bi bi-calendar me-2"></i>
                        분실 날짜/시간 *
                      </label>
                      <input
                        type="datetime-local"
                        id="lostAt"
                        className="form-control"
                        value={formData.lostAt}
                        onChange={(e) => setFormData({ ...formData, lostAt: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* 사례금 */}
                  <div className="mb-4">
                    <label htmlFor="reward" className="form-label fw-semibold">
                      <i className="bi bi-cash-coin me-2"></i>
                      사례금 (선택)
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type="number"
                        id="reward"
                        className="form-control"
                        placeholder="0"
                        min="0"
                        step="1000"
                        value={formData.reward || ''}
                        onChange={(e) => setFormData({ ...formData, reward: Number(e.target.value) })}
                      />
                      <span className="input-group-text">원</span>
                    </div>
                    <div className="form-text">
                      사례금을 제시하면 습득자의 반응률이 높아질 수 있습니다.
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* 안내 메시지 */}
                  <div className="alert alert-info d-flex align-items-start mb-4" role="alert">
                    <i className="bi bi-info-circle-fill me-2 flex-shrink-0"></i>
                    <div className="small">
                      <strong>개인정보 보호</strong><br />
                      인계 승인 전까지는 연락처가 마스킹 처리됩니다.
                      인계가 최종 승인되면 상호 연락처가 공개됩니다.
                    </div>
                  </div>

                  {/* 버튼 그룹 */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          등록 중...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          분실 신고 등록
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/lost/list')}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      취소
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
