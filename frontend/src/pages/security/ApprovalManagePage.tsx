import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function ApprovalManagePage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'VERIFIED' | 'APPROVED' | 'ALL'>('VERIFIED');

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const response = await handoverApi.getAllHandovers({ page: 0, size: 100 });
      setHandovers(response.content);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHandovers = handovers.filter(h => {
    if (filter === 'VERIFIED') {
      return h.status === 'VERIFIED_BY_SECURITY';
    } else if (filter === 'APPROVED') {
      return h.status === 'APPROVED_BY_OFFICE' || 
             h.status === 'SCHEDULED' || 
             h.status === 'COMPLETED';
    }
    return h.status === 'VERIFIED_BY_SECURITY' || 
           h.status === 'APPROVED_BY_OFFICE' || 
           h.status === 'SCHEDULED' || 
           h.status === 'COMPLETED';
  });

  const verifiedCount = handovers.filter(h => h.status === 'VERIFIED_BY_SECURITY').length;
  const approvedCount = handovers.filter(h => 
    h.status === 'APPROVED_BY_OFFICE' || 
    h.status === 'SCHEDULED' || 
    h.status === 'COMPLETED'
  ).length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
          ← 대시보드
        </button>
        <h1 style={{ display: 'inline', marginLeft: '10px' }}>승인 관리</h1>
      </div>

      {/* 통계 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{
          padding: '20px',
          border: '2px solid #9933ff',
          borderRadius: '8px',
          backgroundColor: '#f9f5ff',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            검수 완료 (관리실 승인 대기)
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9933ff' }}>
            {verifiedCount}
          </div>
        </div>
        <div style={{
          padding: '20px',
          border: '2px solid #00cc66',
          borderRadius: '8px',
          backgroundColor: '#f0fff4',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            최종 승인 완료
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00cc66' }}>
            {approvedCount}
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('VERIFIED')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'VERIFIED' ? '#9933ff' : 'white',
            color: filter === 'VERIFIED' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          검수 완료 ({verifiedCount})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'APPROVED' ? '#00cc66' : 'white',
            color: filter === 'APPROVED' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          승인 완료 ({approvedCount})
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

      {/* 인계 목록 */}
      {filteredHandovers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {filter === 'VERIFIED' ? '검수 완료된 인계가 없습니다.' : 
             filter === 'APPROVED' ? '승인 완료된 인계가 없습니다.' : 
             '인계 내역이 없습니다.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredHandovers.map((handover) => (
            <div
              key={handover.id}
              onClick={() => navigate(`/handover/${handover.id}`)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <StatusBadge status={handover.status} />
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  요청: {formatDateTime(handover.createdAt)}
                </div>
              </div>

              <div style={{ 
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                marginBottom: '12px',
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>인계 ID:</strong> #{handover.id}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>인계 방법:</strong> {
                    handover.method === 'MEET' ? '대면 인계' :
                    handover.method === 'OFFICE' ? '관리실 인계' : '배송 인계'
                  }
                </div>
              </div>

              {handover.verifiedBySecurityAt && (
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#f2e6ff',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#9933ff',
                  marginBottom: '8px',
                }}>
                  ✓ 보안 검수 완료: {formatDateTime(handover.verifiedBySecurityAt)}
                </div>
              )}

              {handover.approvedByOfficeAt && (
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#e6fff2',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#00cc66',
                  marginBottom: '8px',
                }}>
                  ✓ 관리실 승인 완료: {formatDateTime(handover.approvedByOfficeAt)}
                </div>
              )}

              {handover.scheduleAt && (
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#fff4e6',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#ff9900',
                  marginBottom: '8px',
                }}>
                  📅 일정: {formatDateTime(handover.scheduleAt)}
                  {handover.meetPlace && ` | 📍 ${handover.meetPlace}`}
                </div>
              )}

              {handover.completedAt && (
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#e6f2ff',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#0066cc',
                }}>
                  🎉 인계 완료: {formatDateTime(handover.completedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
