import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundApi } from '@/api/found.api';
import type { FoundItemCreateRequest } from '@/types/found.types';
import { CATEGORIES } from '@/utils/constants';

export default function FoundItemCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FoundItemCreateRequest>({
    category: '',
    title: '',
    description: '',
    foundAt: '',
    foundPlace: '',
    storageType: 'SELF',
    storageLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title || !formData.description || 
        !formData.foundAt || !formData.foundPlace || !formData.storageType) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await foundApi.create(formData);
      alert('습득물이 등록되었습니다!');
      navigate(`/found/${response.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* 타이틀 */}
            <div className="mb-4">
              <h2 className="fw-bold mb-2">
                <i className="bi bi-plus-circle text-success me-2"></i>
                습득물 등록
              </h2>
              <p className="text-muted mb-0">습득한 물건의 정보를 상세히 입력해주세요</p>
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
                    {['ELECTRONICS', 'WALLET', 'ID_CARD'].includes(formData.category) && (
                      <div className="alert alert-warning mt-2 mb-0">
                        <i className="bi bi-shield-exclamation me-2"></i>
                        <strong>보안 검수 필요:</strong> 이 카테고리는 보안실 검수가 필요합니다.
                      </div>
                    )}
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
                      placeholder="예: 검은색 지갑을 습득했습니다"
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
                      placeholder="습득물의 특징을 자세히 적어주세요 (색상, 브랜드, 크기 등)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    {/* 습득 장소 */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="foundPlace" className="form-label fw-semibold">
                        <i className="bi bi-geo-alt me-2"></i>
                        습득 장소 *
                      </label>
                      <input
                        type="text"
                        id="foundPlace"
                        className="form-control"
                        placeholder="예: 중앙도서관 3층"
                        value={formData.foundPlace}
                        onChange={(e) => setFormData({ ...formData, foundPlace: e.target.value })}
                        required
                      />
                    </div>

                    {/* 습득 날짜/시간 */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="foundAt" className="form-label fw-semibold">
                        <i className="bi bi-calendar me-2"></i>
                        습득 날짜/시간 *
                      </label>
                      <input
                        type="datetime-local"
                        id="foundAt"
                        className="form-control"
                        value={formData.foundAt}
                        onChange={(e) => setFormData({ ...formData, foundAt: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* 보관 방식 */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-box-seam me-2"></i>
                      보관 방식 *
                    </label>
                    <div className="row g-2">
                      {[
                        { value: 'SELF', label: '개인 보관', icon: 'bi-person', color: 'primary' },
                        { value: 'OFFICE', label: '관리실 보관', icon: 'bi-building', color: 'warning' },
                        { value: 'SECURITY', label: '보안실 보관', icon: 'bi-shield-lock', color: 'danger' },
                        { value: 'LOCKER', label: '보관함', icon: 'bi-inbox', color: 'info' },
                      ].map(({ value, label, icon, color }) => (
                        <div key={value} className="col-6 col-md-3">
                          <input
                            type="radio"
                            className="btn-check"
                            name="storageType"
                            id={`storage-${value}`}
                            value={value}
                            checked={formData.storageType === value}
                            onChange={(e) => setFormData({ ...formData, storageType: e.target.value as any })}
                          />
                          <label 
                            className={`btn btn-outline-${color} w-100`} 
                            htmlFor={`storage-${value}`}
                          >
                            <i className={`${icon} d-block mb-1`}></i>
                            <small>{label}</small>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 보관 위치 */}
                  <div className="mb-4">
                    <label htmlFor="storageLocation" className="form-label fw-semibold">
                      <i className="bi bi-pin-map me-2"></i>
                      보관 위치 (선택)
                    </label>
                    <input
                      type="text"
                      id="storageLocation"
                      className="form-control"
                      placeholder="예: 3번 서랍, A-12 보관함"
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    />
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
                      <strong>매칭 시스템</strong><br />
                      등록 후 자동으로 분실 신고와 매칭됩니다.
                      분실자가 인계 요청을 보내면 알림을 받게 됩니다.
                    </div>
                  </div>

                  {/* 버튼 그룹 */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-success btn-lg"
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
                          습득물 등록
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/found/list')}
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
