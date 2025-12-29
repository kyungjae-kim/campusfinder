import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { matchingApi } from '@/api/matching.api';
import type { MatchCandidate } from '@/types/matching.types';
import Loading from '@/components/common/Loading';
import { formatDateTime, getCategoryLabel } from '@/utils/formatters';

export default function MatchingListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lostId = searchParams.get('lostId');
  
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('MatchingListPage mounted, lostId:', lostId);
    
    if (lostId) {
      fetchCandidates(Number(lostId));
    } else {
      setLoading(false);
      setError('분실물 ID가 제공되지 않았습니다. URL에 ?lostId=숫자 형태로 전달해주세요.');
    }
  }, [lostId]);

  const fetchCandidates = async (id: number) => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching match candidates for lostId:', id);
      
      const data = await matchingApi.getMatchCandidates(id);
      console.log('Match candidates received:', data);
      
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch match candidates:', err);
      
      let errorMessage = '매칭 후보를 불러오는데 실패했습니다.';
      
      if (err.response) {
        // 서버가 응답했지만 에러 상태 코드
        errorMessage = `서버 에러 (${err.response.status}): ${
          err.response.data?.message || err.response.data || '알 수 없는 에러'
        }`;
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못함
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else {
        // 요청 설정 중 에러 발생
        errorMessage = err.message || '요청 중 에러가 발생했습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Loading />
          <p className="text-muted mt-3">매칭 후보를 찾고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* 헤더 */}
      <nav className="navbar navbar-light bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <button 
            className="btn btn-link text-decoration-none"
            onClick={() => navigate(lostId ? `/lost/${lostId}` : '/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            {lostId ? '분실물 상세로 돌아가기' : '대시보드로 돌아가기'}
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-link-45deg me-2" style={{ color: '#9933ff' }}></i>
            매칭 후보
            {lostId && <span className="text-muted fs-6 ms-2">(분실물 ID: {lostId})</span>}
          </h2>
          <p className="text-muted mb-0">분실물과 유사한 습득물 목록입니다</p>
        </div>

        {/* 안내 메시지 */}
        <div className="alert alert-info d-flex align-items-start mb-4" role="alert">
          <i className="bi bi-lightbulb me-2 flex-shrink-0"></i>
          <div className="small">
            <strong>매칭 점수 안내</strong><br />
            카테고리, 장소, 날짜, 키워드 일치도에 따라 점수가 부여됩니다.
            점수가 높을수록 해당 습득물일 가능성이 높습니다.
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-danger d-flex align-items-start mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
            <div>
              <strong>오류가 발생했습니다</strong><br />
              {error}
              <div className="mt-2">
                <small>
                  <strong>확인사항:</strong><br />
                  1. 백엔드 서버가 실행 중인가요?<br />
                  2. Matching Service가 정상 동작하나요?<br />
                  3. 분실물 ID({lostId})가 존재하나요?
                </small>
              </div>
              <button 
                className="btn btn-sm btn-outline-danger mt-2"
                onClick={() => lostId && fetchCandidates(Number(lostId))}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 매칭 후보 목록 */}
        {!error && candidates.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">매칭된 습득물이 없습니다</h5>
              <p className="text-muted small">
                현재 등록된 습득물 중 일치하는 항목이 없습니다.<br />
                새로운 습득물이 등록되면 자동으로 매칭됩니다.
              </p>
              {lostId && (
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={() => navigate(`/lost/${lostId}`)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  분실물 상세로 돌아가기
                </button>
              )}
            </div>
          </div>
        ) : !error && (
          <>
            {/* 결과 개수 */}
            <div className="mb-3">
              <span className="badge bg-primary">
                총 {candidates.length}개의 매칭 후보
              </span>
            </div>

            <div className="row g-3">
              {candidates.map((candidate, index) => (
                <div key={candidate.foundId} className="col-12">
                  <div 
                    className="card shadow-sm border-0 card-hover"
                    onClick={() => navigate(`/found/${candidate.foundId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 col-md-9">
                          {/* 순위 및 점수 */}
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <span className={`badge ${
                              index === 0 ? 'bg-warning' : 
                              index === 1 ? 'bg-secondary' : 
                              index === 2 ? 'bg-dark' : 'bg-light text-dark'
                            }`} style={{ fontSize: '16px' }}>
                              #{index + 1}
                            </span>
                            <div className="progress flex-grow-1" style={{ height: '24px' }}>
                              <div 
                                className={`progress-bar ${
                                  candidate.score >= 80 ? 'bg-success' :
                                  candidate.score >= 60 ? 'bg-info' :
                                  candidate.score >= 40 ? 'bg-warning' : 'bg-secondary'
                                }`}
                                role="progressbar" 
                                style={{ width: `${candidate.score}%` }}
                              >
                                <strong>매칭도: {candidate.score}점</strong>
                              </div>
                            </div>
                          </div>

                          {/* 카테고리 */}
                          <div className="mb-2">
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-tag me-1"></i>
                              {getCategoryLabel(candidate.category)}
                            </span>
                          </div>

                          {/* 제목 */}
                          <h5 className="card-title mb-2">
                            {candidate.title}
                          </h5>

                          {/* 설명 */}
                          <p className="card-text text-muted small mb-2 text-truncate-2">
                            {candidate.description}
                          </p>

                          {/* 장소 & 날짜 */}
                          <div className="d-flex gap-3 small text-muted mb-2">
                            <span>
                              <i className="bi bi-geo-alt me-1"></i>
                              {candidate.foundPlace}
                            </span>
                            <span>
                              <i className="bi bi-calendar me-1"></i>
                              {formatDateTime(candidate.foundAt)}
                            </span>
                          </div>

                          {/* 매칭 이유 */}
                          {candidate.matchReasons && candidate.matchReasons.length > 0 && (
                            <div className="mt-2">
                              <small className="text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                {candidate.matchReasons.join(', ')}
                              </small>
                            </div>
                          )}
                        </div>

                        {/* 액션 */}
                        <div className="col-12 col-md-3">
                          <div className="d-flex flex-column gap-2 h-100 justify-content-center mt-3 mt-md-0">
                            <button
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/handover/request?lostId=${lostId}&foundId=${candidate.foundId}`);
                              }}
                            >
                              <i className="bi bi-send me-2"></i>
                              인계 요청
                            </button>
                            <button
                              className="btn btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/found/${candidate.foundId}`);
                              }}
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
          </>
        )}
      </div>
    </div>
  );
}
