import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function OfficeQueuePage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('PENDING');

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

  const handleApprove = async (handoverId: number) => {
    if (!confirm('이 인계 요청을 승인하시겠습니까?')) return;

    try {
      await handoverApi.approve(handoverId);
      await fetchHandovers();
      alert('승인되었습니다!');
    } catch (err: any) {
      alert(err.response?.data?.message || '승인에 실패했습니다.');
    }
  };

  const filteredHandovers = handovers.filter(h => {
    // OFFICE가 승인해야 하는 단계
    const needsOfficeApproval = h.method === 'OFFICE' && 
      (h.status === 'ACCEPTED_BY_FINDER' || h.status === 'VERIFIED_BY_SECURITY');

    if (filter === 'PENDING') {
      return needsOfficeApproval;
    } else if (filter === 'APPROVED') {
      return h.status === 'APPROVED_BY_OFFICE' || h.status === 'SCHEDULED' || h.status === 'COMPLETED';
    }
    return h.method === 'OFFICE';
  });

  const pendingCount = handovers.filter(h => 
    h.method === 'OFFICE' && 
    (h.status === 'ACCEPTED_BY_FINDER' || h.status === 'VERIFIED_BY_SECURITY')
  ).length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
            ← 대시보드
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>
            관리실 접수 대기
            {pendingCount > 0 && (
              <span style={{
                marginLeft: '10px',
                padding: '4px 12px',
                backgroundColor: '#ff9900',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
              }}>
                {pendingCount}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('PENDING')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'PENDING' ? '#ff9900' : 'white',
            color: filter === 'PENDING' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          승인 대기 ({pendingCount})
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
          승인 완료
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
            {filter === 'PENDING' ? '승인 대기 중인 인계가 없습니다.' : '인계 내역이 없습니다.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredHandovers.map((handover) => {
            const isPending = handover.status === 'ACCEPTED_BY_FINDER' || handover.status === 'VERIFIED_BY_SECURITY';

            return (
              <div
                key={handover.id}
                style={{
                  border: isPending ? '2px solid #ff9900' : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: isPending ? '#fff4e6' : 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    {isPending && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#ff9900',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '8px',
                      }}>
                        승인 필요
                      </span>
                    )}
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
                  marginBottom: '12px',
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    <strong>인계 ID:</strong> #{handover.id}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    <strong>분실 신고:</strong> #{handover.lostId}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>습득물:</strong> #{handover.foundId}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/handover/${handover.id}`)}
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
                    상세 보기
                  </button>
                  {isPending && (
                    <button
                      onClick={() => handleApprove(handover.id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#00cc66',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓ 승인
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
