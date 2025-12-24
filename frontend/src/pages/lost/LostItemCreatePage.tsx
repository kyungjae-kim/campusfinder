import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostApi } from '@/api/lost.api';
import type { LostItemCreateRequest } from '@/types/lost.types';
import { CATEGORIES, PLACES } from '@/utils/constants';
import { toDatetimeLocalString } from '@/utils/formatters';

export default function LostItemCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<LostItemCreateRequest>({
    category: '',
    title: '',
    description: '',
    lostAt: toDatetimeLocalString(new Date()),
    lostPlace: '',
    reward: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await lostApi.create(formData);
      console.log(result);
      alert('분실 신고가 등록되었습니다!');
      navigate(`/lost/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
          ← 대시보드
        </button>
        <button onClick={() => navigate('/lost/list')}>
          내 분실 신고 목록
        </button>
      </div>

      <h1>분실 신고 등록</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 카테고리 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            카테고리 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          >
            <option value="">선택하세요</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            제목 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="예: 검은색 노트북 분실"
            required
            maxLength={100}
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>

        {/* 상세 설명 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            상세 설명 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="분실물의 특징을 자세히 적어주세요"
            required
            rows={5}
            style={{ width: '100%', padding: '10px', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        {/* 분실 날짜 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            분실 일시 *
          </label>
          <input
            type="datetime-local"
            value={formData.lostAt}
            onChange={(e) => setFormData({ ...formData, lostAt: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>

        {/* 분실 장소 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            분실 장소 *
          </label>
          <select
            value={formData.lostPlace}
            onChange={(e) => setFormData({ ...formData, lostPlace: e.target.value })}
            style={{ width: '100%', padding: '10px', fontSize: '14px', marginBottom: '8px' }}
          >
            <option value="">선택하세요</option>
            {PLACES.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formData.lostPlace}
            onChange={(e) => setFormData({ ...formData, lostPlace: e.target.value })}
            placeholder="또는 직접 입력"
            required
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>

        {/* 사례금 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            사례금 (선택)
          </label>
          <input
            type="number"
            value={formData.reward || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              reward: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder="사례금 금액 (원)"
            min="0"
            step="1000"
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#ffe6e6', 
            color: '#cc0000', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: loading ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '14px 24px',
              fontSize: '16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
