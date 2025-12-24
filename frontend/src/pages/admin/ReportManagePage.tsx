import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import type { Report } from '@/types/report.types';
import Loading from '@/components/common/Loading';
import { formatDateTime } from '@/utils/formatters';

export default function ReportManagePage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'OPEN' | 'RESOLVED' | 'ALL'>('OPEN');

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReports(undefined, { page: 0, size: 100 });
      setReports(response.content);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (action: 'BLIND' | 'IGNORE') => {
    if (!selectedReport || !adminNote.trim()) {
      alert('처리 사유를 입력해주세요.');
      return;
    }

    try {
      setProcessing(true);

      // 신고 처리
      await adminApi.resolveReport(selectedReport.id, {
        adminNote,
        action,
      });

      // 블라인드 처리
      if (action === 'BLIND') {
        await adminApi.blindItem(selectedReport.targetType, selectedReport.targetId);
      }

      await fetchReports();
      setSelectedReport(null);
      setAdminNote('');
      alert(action === 'BLIND' ? '블라인드 처리되었습니다.' : '신고가 무시되었습니다.');
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'OPEN') return r.status === 'OPEN';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const openCount = reports.filter(r => r.status === 'OPEN').length;
  const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
          ← 대시보드
        </button>
        <h1 style={{ display: 'inline', marginLeft: '10px' }}>
          신고 관리
          {openCount > 0 && (
            <span style={{
              marginLeft: '10px',
              padding: '4px 12px',
              backgroundColor: '#ff3333',
              color: 'white',
              borderRadius: '12px',
              fontSize: '16px',
            }}>
              {openCount}
            </span>
          )}
        </h1>
      </div>

      {/* 통계 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{
          padding: '20px',
          border: '2px solid #ff3333',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            처리 대기
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff3333' }}>
            {openCount}
          </div>
        </div>
        <div style={{
          padding: '20px',
          border: '2px solid #00cc66',
          borderRadius: '8px',
          backgroundColor: '#f0fff4',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            처리 완료
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00cc66' }}>
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('OPEN')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'OPEN' ? '#ff3333' : 'white',
            color: filter === 'OPEN' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          처리 대기 ({openCount})
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'RESOLVED' ? '#00cc66' : 'white',
            color: filter === 'RESOLVED' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          처리 완료 ({resolvedCount})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'ALL' ? '#0066cc' : 'white',
            color: filter === 'ALL' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          전체
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#ffe6e6', 
          color: '#cc0000', 
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* 신고 목록 */}
      {filteredReports.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {filter === 'OPEN' ? '처리할 신고가 없습니다.' : '신고 내역이 없습니다.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredReports.map((report) => (
            <div
              key={report.id}
              style={{
                border: report.status === 'OPEN' ? '2px solid #ff3333' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: report.status === 'OPEN' ? '#fff5f5' : 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: report.status === 'OPEN' ? '#ff3333' : '#00cc66',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginRight: '8px',
                  }}>
                    {report.status === 'OPEN' ? '⚠️ 처리 대기' : '✓ 처리 완료'}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {report.targetType === 'LOST' ? '분실 신고' :
                     report.targetType === 'FOUND' ? '습득물' : '메시지'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  신고: {formatDateTime(report.createdAt)}
                </div>
              </div>

              <div style={{ 
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '12px',
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>신고 ID:</strong> #{report.id}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>대상:</strong> {report.targetType} #{report.targetId}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>신고자:</strong> {report.reporterNickname || `User #${report.reporterId}`}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <strong>사유:</strong> {report.reason}
                </div>
              </div>

              {report.status === 'RESOLVED' && report.adminNote && (
                <div style={{ 
                  padding: '12px',
                  backgroundColor: '#e6fff2',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                    관리자 처리 내역
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {report.adminNote}
                  </div>
                  {report.resolvedAt && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      처리 일시: {formatDateTime(report.resolvedAt)}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    const path = report.targetType === 'LOST' ? `/lost/${report.targetId}` :
                                report.targetType === 'FOUND' ? `/found/${report.targetId}` :
                                `/handover/${report.targetId}`;
                    navigate(path);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  대상 보기
                </button>
                {report.status === 'OPEN' && (
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminNote('');
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff9900',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    처리하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 처리 모달 */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{ marginTop: 0 }}>신고 처리</h3>

            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                <strong>신고 대상:</strong> {selectedReport.targetType} #{selectedReport.targetId}
              </div>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                <strong>신고 사유:</strong> {selectedReport.reason}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                처리 내역
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="처리 내역을 입력하세요"
                rows={4}
                style={{ width: '100%', padding: '10px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleResolve('BLIND')}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: processing ? '#ccc' : '#ff3333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                블라인드 처리
              </button>
              <button
                onClick={() => handleResolve('IGNORE')}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: processing ? '#ccc' : '#00cc66',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                무시하기
              </button>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNote('');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
