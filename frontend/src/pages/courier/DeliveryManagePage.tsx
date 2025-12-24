import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import type { Handover } from '@/types/handover.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function DeliveryManagePage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED'>('SCHEDULED');

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const response = await handoverApi.getAllHandovers({ page: 0, size: 100 });
      // 배송 방식만 필터링
      const courierHandovers = response.content.filter((h: Handover) => h.method === 'COURIER');
      setHandovers(courierHandovers);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHandovers = handovers.filter(h => {
    if (filter === 'SCHEDULED') {
      return h.status === 'SCHEDULED';
    } else if (filter === 'COMPLETED') {
      return h.status === 'COMPLETED';
    }
    return true;
  });

  const scheduledCount = handovers.filter(h => h.status === 'SCHEDULED').length;
  const completedCount = handovers.filter(h => h.status === 'COMPLETED').length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
          ← 대시보드
        </button>
        <h1 style={{ display: 'inline', marginLeft: '10px' }}>
          배송 관리
          {scheduledCount > 0 && (
            <span style={{
              marginLeft: '10px',
              padding: '4px 12px',
              backgroundColor: '#00cccc',
              color: 'white',
              borderRadius: '12px',
              fontSize: '16px',
            }}>
              {scheduledCount}
            </span>
          )}
        </h1>
      </div>

      {/* 안내 */}
      <div style={{ 
        padding: '16px',
        backgroundColor: '#e6ffff',
        borderLeft: '4px solid #00cccc',
        borderRadius: '4px',
        marginBottom: '20px',
      }}>
        <strong>📦 배송 안내</strong>
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          실제 택배 서비스와 연동되지 않습니다. 배송 상태만 관리합니다.
        </div>
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
          border: '2px solid #ff9900',
          borderRadius: '8px',
          backgroundColor: '#fff4e6',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            배송 예정
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9900' }}>
            {scheduledCount}
          </div>
        </div>
        <div style={{
          padding: '20px',
          border: '2px solid #00cc66',
          borderRadius: '8px',
          backgroundColor: '#f0fff4',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            배송 완료
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00cc66' }}>
            {completedCount}
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('SCHEDULED')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'SCHEDULED' ? '#ff9900' : 'white',
            color: filter === 'SCHEDULED' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          배송 예정 ({scheduledCount})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'COMPLETED' ? '#00cc66' : 'white',
            color: filter === 'COMPLETED' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          배송 완료 ({completedCount})
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

      {/* 배송 목록 */}
      {filteredHandovers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {filter === 'SCHEDULED' ? '배송 예정 건이 없습니다.' : 
             filter === 'COMPLETED' ? '배송 완료 건이 없습니다.' :
             '배송 내역이 없습니다.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredHandovers.map((handover) => (
            <div
              key={handover.id}
              onClick={() => navigate(`/handover/${handover.id}`)}
              style={{
                border: handover.status === 'SCHEDULED' ? '2px solid #ff9900' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: handover.status === 'SCHEDULED' ? '#fff4e6' : 'white',
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
                  {handover.status === 'SCHEDULED' && (
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
                      📦 배송 예정
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
                  <strong>배송 번호:</strong> COURIER-{handover.id}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  <strong>분실 신고:</strong> #{handover.lostId}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <strong>습득물:</strong> #{handover.foundId}
                </div>
              </div>

              {/* 배송 단계 */}
              <div style={{ 
                padding: '16px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                marginBottom: '12px',
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>
                  배송 단계
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <DeliveryStep 
                    label="픽업" 
                    completed={handover.status !== 'REQUESTED'}
                  />
                  <DeliveryStep 
                    label="이동 중" 
                    completed={handover.status === 'SCHEDULED' || handover.status === 'COMPLETED'}
                  />
                  <DeliveryStep 
                    label="전달 완료" 
                    completed={handover.status === 'COMPLETED'}
                  />
                </div>
              </div>

              {handover.scheduleAt && (
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#fff4e6',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#ff9900',
                  marginBottom: '8px',
                }}>
                  📅 배송 예정: {formatDateTime(handover.scheduleAt)}
                  {handover.meetPlace && ` | 📍 ${handover.meetPlace}`}
                </div>
              )}

              {handover.completedAt && (
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#e6fff2',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#00cc66',
                }}>
                  ✅ 배송 완료: {formatDateTime(handover.completedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 배송 단계 컴포넌트
interface DeliveryStepProps {
  label: string;
  completed: boolean;
}

function DeliveryStep({ label, completed }: DeliveryStepProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: completed ? '#00cc66' : '#ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
      }}>
        {completed ? '✓' : '○'}
      </div>
      <div style={{ 
        fontSize: '14px', 
        color: completed ? '#333' : '#999',
        fontWeight: completed ? 'bold' : 'normal',
      }}>
        {label}
      </div>
    </div>
  );
}
