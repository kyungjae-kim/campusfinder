import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import { lostApi } from '@/api/lost.api';
import { foundApi } from '@/api/found.api';
import type { HandoverCreateRequest, HandoverMethod } from '@/types/handover.types';
import type { LostItem } from '@/types/lost.types';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import { formatDateTime } from '@/utils/formatters';
import { HANDOVER_METHODS } from '@/utils/constants';

export default function HandoverRequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const lostId = searchParams.get('lostId');
  const foundId = searchParams.get('foundId');

  const [lostItem, setLostItem] = useState<LostItem | null>(null);
  const [foundItem, setFoundItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<HandoverCreateRequest>({
    lostId: parseInt(lostId || '0'),
    foundId: parseInt(foundId || '0'),
    method: 'MEET',
    message: '',
  });

  useEffect(() => {
    if (lostId && foundId) {
      fetchItems();
    }
  }, [lostId, foundId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const [lost, found] = await Promise.all([
        lostApi.getById(parseInt(lostId!)),
        foundApi.getById(parseInt(foundId!)),
      ]);
      setLostItem(lost);
      setFoundItem(found);
    } catch (err: any) {
      setError(err.response?.data?.message || '정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await handoverApi.create(formData);
      alert('인계 요청이 전송되었습니다!');
      navigate(`/handover/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '인계 요청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (error && !lostItem) {
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
          onClick={() => navigate(-1)}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>

      <h1 style={{ marginBottom: '30px' }}>인계 요청하기</h1>

      {/* 분실 신고 정보 */}
      {lostItem && (
        <div style={{ 
          border: '1px solid #0066cc',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#f0f7ff',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>
            내 분실 신고
          </h3>
          <div>
            <span style={{ 
              padding: '4px 8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
              marginRight: '8px',
            }}>
              {lostItem.category}
            </span>
            <strong>{lostItem.title}</strong>
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            📍 {lostItem.lostPlace} | 🕐 {formatDateTime(lostItem.lostAt)}
          </div>
        </div>
      )}

      {/* 습득물 정보 */}
      {foundItem && (
        <div style={{ 
          border: '1px solid #00cc66',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          backgroundColor: '#f0fff4',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#00cc66' }}>
            매칭된 습득물
          </h3>
          <div>
            <span style={{ 
              padding: '4px 8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
              marginRight: '8px',
            }}>
              {foundItem.category}
            </span>
            <strong>{foundItem.title}</strong>
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            📍 {foundItem.foundPlace} | 🕐 {formatDateTime(foundItem.foundAt)}
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            📦 보관: {foundItem.storageType === 'SELF' ? '직접보관' : 
                     foundItem.storageType === 'OFFICE' ? '관리실' :
                     foundItem.storageType === 'SECURITY' ? '보안실' : '보관함'} - {foundItem.storageLocation}
          </div>
        </div>
      )}

      {/* 인계 요청 폼 */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 인계 방법 선택 */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>
            인계 방법 선택 *
          </label>
          <div style={{ display: 'grid', gap: '12px' }}>
            {HANDOVER_METHODS.map((method) => (
              <label
                key={method.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  border: formData.method === method.value ? '2px solid #0066cc' : '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: formData.method === method.value ? '#f0f7ff' : 'white',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="method"
                  value={method.value}
                  checked={formData.method === method.value}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as HandoverMethod })}
                  style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {method.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {method.value === 'MEET' && '약속 장소와 시간을 정해 직접 만나서 인계합니다.'}
                    {method.value === 'OFFICE' && '관리실에서 만나거나 관리실에 맡겨서 인계합니다.'}
                    {method.value === 'COURIER' && '택배나 보관함을 통해 비대면으로 인계합니다.'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 메시지 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            메시지 (선택)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="습득자에게 전달할 메시지를 입력하세요"
            rows={4}
            style={{ width: '100%', padding: '12px', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        {/* 안내 메시지 */}
        <div style={{ 
          padding: '16px',
          backgroundColor: '#fff4e6',
          borderLeft: '4px solid #ff9900',
          borderRadius: '4px',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <strong>💡 인계 절차 안내</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>습득자가 요청을 확인하고 승인하면 다음 단계로 진행됩니다.</li>
            <li>전자기기/지갑/신분증의 경우 보안 검수가 필요할 수 있습니다.</li>
            <li>관리실 인계의 경우 관리실 승인이 필요합니다.</li>
            <li>승인 완료 후 서로의 연락처가 공개됩니다.</li>
          </ul>
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
            disabled={submitting}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: submitting ? '#ccc' : '#00cc66',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '요청 중...' : '인계 요청 전송'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '16px 24px',
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
