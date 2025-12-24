import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function HandoverInboxPage() {
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
      const data = await handoverApi.getMyResponses();
      setHandovers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = handovers.filter(h => h.status === 'REQUESTED').length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
            ← 대시보드
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>
            인계 수신함
            {pendingCount > 0 && (
              <span style={{
                marginLeft: '10px',
                padding: '4px 12px',
                backgroundColor: '#ff3333',
                color: 'white',
                borderRadius: '12px',
                fontSize: '14px',
              }}>
                {pendingCount}
              </span>
            )}
          </h1>
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
            받은 인계 요청이 없습니다.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {handovers.map((handover) => {
            const isPending = handover.status === 'REQUESTED';

            return (
              <div
                key={handover.id}
                onClick={() => navigate(`/handover/${handover.id}`)}
                style={{
                  border: isPending ? '2px solid #ff9900' : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  backgroundColor: isPending ? '#fff4e6' : 'white',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isPending && (
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#ff9900',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                  }}>
                    🔔 새 요청
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ 
                      padding: '4px 8px',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '8px',
                      border: '1px solid #ddd',
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
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
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

                {isPending && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#e6f2ff',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#0066cc',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                    👉 클릭하여 요청을 확인하고 승인/거절하세요
                  </div>
                )}

                {handover.scheduleAt && (
                  <div style={{ fontSize: '14px', color: '#0066cc', marginTop: '8px' }}>
                    📅 일정: {formatDateTime(handover.scheduleAt)}
                    {handover.meetPlace && ` | 📍 ${handover.meetPlace}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
