import { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin.api';
import type { Report } from '@/types/report.types';
import Loading from '@/components/common/Loading';
import { formatDateTime } from '@/utils/formatters';

export default function ReportManagePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReports();
      setReports(data.content || data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlind = async (reportId: number, targetType: string, targetId: number) => {
    if (!confirm('이 콘텐츠를 블라인드 처리하시겠습니까?')) return;

    setProcessingId(reportId);
    try {
      await adminApi.blindContent(targetType, targetId);
      await adminApi.resolveReport(reportId, { adminNote: '블라인드 처리됨', action: 'BLIND' });
      alert('블라인드 처리되었습니다.');
      fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (reportId: number) => {
    if (!confirm('이 신고를 해결 완료로 처리하시겠습니까?')) return;

    setProcessingId(reportId);
    try {
      await adminApi.resolveReport(reportId, { adminNote: '문제없음', action: 'IGNORE' });
      alert('신고가 처리되었습니다.');
      fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LOST: '분실 신고',
      FOUND: '습득물',
      MESSAGE: '메시지',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      LOST: 'bi-exclamation-circle text-primary',
      FOUND: 'bi-check-circle text-success',
      MESSAGE: 'bi-chat-dots text-info',
    };
    return icons[type] || 'bi-file-text';
  };

  const getPendingCount = () => reports.filter(r => r.status === 'OPEN').length;

  if (loading) return <Loading />;

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-flag text-danger me-2"></i>
            신고 관리
            {getPendingCount() > 0 && (
              <span className="badge bg-danger ms-2">{getPendingCount()}</span>
            )}
          </h2>
          <p className="text-muted mb-0">사용자가 신고한 콘텐츠를 검토하고 처리하세요</p>
        </div>

        {/* 필터 */}
        <ul className="nav nav-pills mb-4">
          {[
            { key: 'ALL', label: '전체', icon: 'bi-list' },
            { key: 'OPEN', label: '대기중', icon: 'bi-hourglass-split' },
            { key: 'RESOLVED', label: '처리완료', icon: 'bi-check-circle' },
          ].map(({ key, label, icon }) => (
            <li key={key} className="nav-item">
              <button
                className={`nav-link ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key as any)}
              >
                <i className={`${icon} me-1`}></i>
                {label}
                <span className="badge bg-light text-dark ms-2">
                  {key === 'ALL' ? reports.length :
                   key === 'OPEN' ? getPendingCount() :
                   reports.filter(r => r.status === 'RESOLVED').length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* 신고 목록 */}
        {filteredReports.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">
                {filter === 'OPEN' ? '대기중인 신고가 없습니다' : '신고 내역이 없습니다'}
              </h5>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredReports.map((report) => (
              <div key={report.id} className="col-12">
                <div className={`card shadow-sm border-0 ${
                  report.status === 'OPEN' ? 'border-start border-warning border-4' : ''
                }`}>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-8">
                        {/* 타입 & 상태 */}
                        <div className="d-flex gap-2 mb-3">
                          <span className="badge bg-light text-dark">
                            <i className={`${getTypeIcon(report.targetType)} me-1`}></i>
                            {getTypeLabel(report.targetType)}
                          </span>
                          <span className={`badge ${
                            report.status === 'OPEN' ? 'bg-warning' : 'bg-success'
                          }`}>
                            {report.status === 'OPEN' ? '대기중' : '처리완료'}
                          </span>
                        </div>

                        {/* 신고 내용 */}
                        <h5 className="card-title mb-2">
                          신고 사유: {report.reason}
                        </h5>

                        {/* 대상 정보 */}
                        <div className="alert alert-light py-2 px-3 mb-2">
                          <i className="bi bi-link-45deg me-1"></i>
                          <strong>대상 ID:</strong> {report.targetType}-{report.targetId}
                        </div>

                        {/* 신고자 정보 */}
                        <p className="text-muted small mb-2">
                          <i className="bi bi-person me-1"></i>
                          신고자: {report.reporterName || '알 수 없음'}
                        </p>

                        {/* 신고일 */}
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          신고일: {formatDateTime(report.createdAt)}
                        </small>

                        {report.resolvedAt && (
                          <div className="mt-2">
                            <small className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              처리일: {formatDateTime(report.resolvedAt)}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="col-12 col-md-4">
                        <div className="d-flex flex-column gap-2 h-100 justify-content-center">
                          {report.status === 'OPEN' && (
                            <>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleBlind(report.id, report.targetType, report.targetId)}
                                disabled={processingId === report.id}
                              >
                                {processingId === report.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    처리 중...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-eye-slash me-2"></i>
                                    블라인드 처리
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleResolve(report.id)}
                                disabled={processingId === report.id}
                              >
                                <i className="bi bi-check-circle me-2"></i>
                                문제없음 (해결)
                              </button>
                            </>
                          )}
                          
                          {report.status === 'RESOLVED' && (
                            <div className="alert alert-success mb-0">
                              <i className="bi bi-check-circle-fill me-2"></i>
                              처리 완료
                            </div>
                          )}
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
