import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import type { LoginRequest } from '@/types/auth.types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      
      // 토큰 저장
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      // 대시보드로 이동
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                {/* 로고 및 타이틀 */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-search-heart fs-1 text-primary"></i>
                  </div>
                  <h3 className="fw-bold text-primary mb-1">캠퍼스 분실물 플랫폼</h3>
                  <p className="text-muted small">분실물과 습득물을 연결합니다</p>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-semibold">
                      <i className="bi bi-person me-2"></i>아이디
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control form-control-lg"
                      placeholder="아이디를 입력하세요"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="bi bi-lock me-2"></i>비밀번호
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control form-control-lg"
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* 로그인 버튼 */}
                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          로그인 중...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          로그인
                        </>
                      )}
                    </button>
                  </div>

                  {/* 구분선 */}
                  <div className="position-relative my-4">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                      또는
                    </span>
                  </div>

                  {/* 회원가입 버튼 */}
                  <div className="d-grid">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => navigate('/register')}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      회원가입
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="text-center mt-3">
              <p className="text-muted small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                캠퍼스 내에서 발생한 분실물/습득물을 안전하게 연결합니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
