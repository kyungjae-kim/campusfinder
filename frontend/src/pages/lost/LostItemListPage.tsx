import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import type { LostItem } from '@/types/lost.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, formatMoney, getCategoryLabel } from '@/utils/formatters';

export default function LostItemListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'MATCHED' | 'CLOSED'>('ALL');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await lostApi.getMy();
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
            ← 대시보드
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>내 분실 신고</h1>
        </div>
        <button 
          onClick={() => navigate('/lost/create')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + 새 분실 신고
        </button>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['ALL', 'OPEN', 'MATCHED', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              backgroundColor: filter === status ? '#0066cc' : 'white',
              color: filter === status ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {status === 'ALL' ? '전체' : status === 'OPEN' ? '진행중' : status === 'MATCHED' ? '매칭됨' : '완료'}
          </button>
        ))}
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

      {filteredItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {filter === 'ALL' ? '등록된 분실 신고가 없습니다.' : `${filter} 상태의 분실 신고가 없습니다.`}
          </p>
          <button
            onClick={() => navigate('/lost/create')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            첫 분실 신고 등록하기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/lost/${item.id}`)}
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
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '8px',
                  }}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                {item.reward && (
                  <span style={{ 
                    color: '#ff6600', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}>
                    사례금 {formatMoney(item.reward)}
                  </span>
                )}
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                {item.title}
              </h3>

              <p style={{ 
                margin: '0 0 12px 0', 
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.description}
              </p>

              <div style={{ fontSize: '13px', color: '#999' }}>
                <span style={{ marginRight: '16px' }}>
                  📍 {item.lostPlace}
                </span>
                <span style={{ marginRight: '16px' }}>
                  🕐 {formatDateTime(item.lostAt)}
                </span>
                <span>
                  등록: {formatDateTime(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
