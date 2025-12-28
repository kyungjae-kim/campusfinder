import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import type { RegisterRequest } from '@/types/auth.types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    password: '',
    nickname: '',
    role: 'LOSER',
    affiliation: 'STUDENT',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register(formData);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                {/* 헤더 */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
                  </div>
                  <h3 className="fw-bold text-primary mb-1">회원가입</h3>
                  <p className="text-muted small">캠퍼스 분실물 플랫폼에 가입하세요</p>
                </div>

                {/* 회원가입 폼 */}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* 아이디 */}
                    <div className="col-12">
                      <label htmlFor="username" className="form-label fw-semibold">
                        <i className="bi bi-person me-2"></i>아이디 *
                      </label>
                      <input
                        type="text"
                        id="username"
                        className="form-control"
                        placeholder="아이디를 입력하세요"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>

                    {/* 비밀번호 */}
                    <div className="col-12">
                      <label htmlFor="password" className="form-label fw-semibold">
                        <i className="bi bi-lock me-2"></i>비밀번호 *
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder="비밀번호를 입력하세요"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>

                    {/* 닉네임 */}
                    <div className="col-12">
                      <label htmlFor="nickname" className="form-label fw-semibold">
                        <i className="bi bi-tag me-2"></i>닉네임 *
                      </label>
                      <input
                        type="text"
                        id="nickname"
                        className="form-control"
                        placeholder="닉네임을 입력하세요"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        required
                      />
                    </div>

                    {/* 역할 */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="role" className="form-label fw-semibold">
                        <i className="bi bi-briefcase me-2"></i>역할 *
                      </label>
                      <select
                        id="role"
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      >
                        <option value="LOSER">분실자</option>
                        <option value="FINDER">습득자</option>
                        <option value="OFFICE">관리실</option>
                        <option value="SECURITY">보안</option>
                        <option value="COURIER">배송</option>
                      </select>
                      <div className="form-text">
                        {formData.role === 'LOSER' && '분실물을 신고하고 찾을 수 있습니다'}
                        {formData.role === 'FINDER' && '습득물을 등록하고 인계할 수 있습니다'}
                        {formData.role === 'OFFICE' && '보관 및 인계를 관리합니다'}
                        {formData.role === 'SECURITY' && '고가품 검수 및 승인을 담당합니다'}
                        {formData.role === 'COURIER' && '배송 단계를 처리합니다'}
                      </div>
                    </div>

                    {/* 소속 */}
                    <div className="col-12 col-md-6">
                      <label htmlFor="affiliation" className="form-label fw-semibold">
                        <i className="bi bi-building me-2"></i>소속 *
                      </label>
                      <select
                        id="affiliation"
                        className="form-select"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value as any })}
                      >
                        <option value="STUDENT">학생</option>
                        <option value="STAFF">교직원</option>
                        <option value="EXTERNAL">외부</option>
                      </select>
                    </div>

                    {/* 전화번호 */}
                    <div className="col-12">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        <i className="bi bi-telephone me-2"></i>전화번호 *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="form-control"
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    {/* 이메일 */}
                    <div className="col-12">
                      <label htmlFor="email" className="form-label fw-semibold">
                        <i className="bi bi-envelope me-2"></i>이메일 *
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* 안내 메시지 */}
                  <div className="alert alert-info d-flex align-items-start mt-3" role="alert">
                    <i className="bi bi-info-circle-fill me-2 flex-shrink-0"></i>
                    <div className="small">
                      인계 완료 전까지는 개인정보가 마스킹 처리됩니다.<br />
                      연락처는 인계 승인 후에만 공개됩니다.
                    </div>
                  </div>

                  {/* 버튼 그룹 */}
                  <div className="d-grid gap-2 mt-4">
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
                          회원가입
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/login')}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      로그인으로 돌아가기
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
