import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function MyHandoverListPage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const data = await handoverApi.getMyRequests();
      setHandovers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
            ← 대시보드
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>내 인계 요청</h1>
        </div>
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

      {handovers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            진행 중인 인계 요청이 없습니다.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {handovers.map((handover) => (
            <div
              key={handover.id}
              onClick={() => navigate(`/handover/${handover.id}`)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: 'white',
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
                  <span style={{ 
                    padding: '4px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '8px',
                  }}>
                    {handover.method === 'MEET' ? '대면인계' : 
                     handover.method === 'OFFICE' ? '관리실' : '배송'}
                  </span>
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
                marginBottom: '8px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>
                  분실 신고 ID: #{handover.lostId}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  습득물 ID: #{handover.foundId}
                </div>
              </div>

              {handover.scheduleAt && (
                <div style={{ fontSize: '14px', color: '#0066cc', marginTop: '8px' }}>
                  📅 일정: {formatDateTime(handover.scheduleAt)}
                  {handover.meetPlace && ` | 📍 ${handover.meetPlace}`}
                </div>
              )}

              {handover.status === 'CANCELED' && handover.cancelReason && (
                <div style={{ 
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#ffe6e6',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#cc0000',
                }}>
                  취소 사유: {handover.cancelReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
