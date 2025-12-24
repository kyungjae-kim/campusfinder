import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import type { LostItem } from '@/types/lost.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, formatMoney, getCategoryLabel } from '@/utils/formatters';

export default function LostItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem(parseInt(id));
    }
  }, [id]);

  const fetchItem = async (itemId: number) => {
    try {
      setLoading(true);
      const data = await lostApi.getById(itemId);
      setItem(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (!confirm('정말로 이 분실 신고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await lostApi.delete(item.id);
      alert('삭제되었습니다.');
      navigate('/lost/list');
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffe6e6', 
          color: '#cc0000', 
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          {error}
        </div>
        <button 
          onClick={() => navigate('/lost/list')}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }
  if (!item) return null;

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isOwner = currentUser && currentUser.id === item.userId;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/lost/list')}>
          ← 목록으로
        </button>
        {isOwner && item.status === 'OPEN' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/lost/${item.id}/edit`)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '8px 16px',
                backgroundColor: deleting ? '#ccc' : '#cc0000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: deleting ? 'not-allowed' : 'pointer',
              }}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: 'white',
      }}>
        {/* 카테고리 & 상태 */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '6px 12px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '14px',
            marginRight: '10px',
          }}>
            {getCategoryLabel(item.category)}
          </span>
          <StatusBadge status={item.status} />
        </div>

        {/* 제목 */}
        <h1 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>
          {item.title}
        </h1>

        {/* 사례금 */}
        {item.reward && (
          <div style={{ 
            padding: '16px',
            backgroundColor: '#fff4e6',
            borderLeft: '4px solid #ff9900',
            marginBottom: '20px',
            borderRadius: '4px',
          }}>
            <span style={{ fontSize: '14px', color: '#666', marginRight: '10px' }}>
              사례금
            </span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6600' }}>
              {formatMoney(item.reward)}
            </span>
          </div>
        )}

        {/* 정보 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '120px 1fr',
          gap: '16px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>분실 일시</div>
          <div>{formatDateTime(item.lostAt)}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>분실 장소</div>
          <div>{item.lostPlace}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>등록 일시</div>
          <div>{formatDateTime(item.createdAt)}</div>
        </div>

        {/* 상세 설명 */}
        <div>
          <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>상세 설명</h3>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}>
            {item.description}
          </div>
        </div>

        {/* 매칭 후보 보기 버튼 (나중에 구현) */}
        {isOwner && item.status === 'OPEN' && (
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={() => navigate(`/lost/${item.id}/matching`)}
              style={{
                padding: '14px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#00cc66',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              🔍 매칭 후보 찾기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
