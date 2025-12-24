import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundApi } from '@/api/found.api';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, getCategoryLabel } from '@/utils/formatters';

export default function FoundItemListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'REGISTERED' | 'STORED' | 'IN_HANDOVER' | 'HANDED_OVER'>('ALL');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await foundApi.getMy();
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
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>내 습득물</h1>
        </div>
        <button 
          onClick={() => navigate('/found/create')}
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
          + 새 습득물 등록
        </button>
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { value: 'ALL', label: '전체' },
          { value: 'REGISTERED', label: '등록됨' },
          { value: 'STORED', label: '보관중' },
          { value: 'IN_HANDOVER', label: '인계중' },
          { value: 'HANDED_OVER', label: '인계완료' },
        ].map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value as any)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              backgroundColor: filter === status.value ? '#0066cc' : 'white',
              color: filter === status.value ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {status.label}
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
            {filter === 'ALL' ? '등록된 습득물이 없습니다.' : `${filter} 상태의 습득물이 없습니다.`}
          </p>
          <button
            onClick={() => navigate('/found/create')}
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
            첫 습득물 등록하기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/found/${item.id}`)}
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
                <span style={{ 
                  padding: '4px 8px',
                  backgroundColor: '#e6f2ff',
                  color: '#0066cc',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  {item.storageType === 'SELF' ? '직접보관' : 
                   item.storageType === 'OFFICE' ? '관리실' :
                   item.storageType === 'SECURITY' ? '보안실' : '보관함'}
                </span>
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
                  📍 {item.foundPlace}
                </span>
                <span style={{ marginRight: '16px' }}>
                  🕐 {formatDateTime(item.foundAt)}
                </span>
                <span style={{ marginRight: '16px' }}>
                  📦 {item.storageLocation}
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
