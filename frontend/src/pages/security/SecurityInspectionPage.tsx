import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handoverApi } from '@/api/handover.api';
import { foundApi } from '@/api/found.api';
import type { Handover } from '@/types/handover.types';
import type { FoundItem } from '@/types/found.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';
import { CATEGORIES } from '@/utils/constants';

// 보안 검수가 필요한 카테고리 (enum 값)
const SECURITY_CHECK_CATEGORIES: string[] = CATEGORIES
  .filter(cat => cat.requiresSecurityCheck)
  .map(cat => cat.value);

export default function SecurityInspectionPage() {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [foundItems, setFoundItems] = useState<Map<number, FoundItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await handoverApi.getAllHandovers({ page: 0, size: 100 });
      
      // 보안 검수가 필요한 인계 건만 필터링
      const needsVerification = response.content.filter((h: Handover) => 
        h.status === 'ACCEPTED_BY_FINDER'
      );
      
      setHandovers(needsVerification);

      // 습득물 정보 가져오기
      const itemMap = new Map<number, FoundItem>();
      for (const handover of needsVerification) {
        try {
          const item = await foundApi.getById(handover.foundId);
          itemMap.set(handover.foundId, item);
        } catch (err) {
          console.error(`Failed to fetch found item ${handover.foundId}:`, err);
        }
      }
      setFoundItems(itemMap);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (handoverId: number) => {
    if (!confirm('이 인계 건의 보안 검수를 완료하시겠습니까?')) return;

    try {
      await handoverApi.verify(handoverId);
      await fetchData();
      alert('검수가 완료되었습니다!');
    } catch (err: any) {
      alert(err.response?.data?.message || '검수 처리에 실패했습니다.');
    }
  };

  // 보안 검수가 필요한 건만 필터링
  const itemsNeedingCheck = handovers.filter(h => {
    const item = foundItems.get(h.foundId);
    return item && SECURITY_CHECK_CATEGORIES.includes(item.category);
  });

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
          ← 대시보드
        </button>
        <h1 style={{ display: 'inline', marginLeft: '10px' }}>
          보안 검수 목록
          {itemsNeedingCheck.length > 0 && (
            <span style={{
              marginLeft: '10px',
              padding: '4px 12px',
              backgroundColor: '#9933ff',
              color: 'white',
              borderRadius: '12px',
              fontSize: '16px',
            }}>
              {itemsNeedingCheck.length}
            </span>
          )}
        </h1>
      </div>

      {/* 안내 메시지 */}
      <div style={{ 
        padding: '16px',
        backgroundColor: '#f2e6ff',
        borderLeft: '4px solid #9933ff',
        borderRadius: '4px',
        marginBottom: '20px',
      }}>
        <strong>🔒 보안 검수 대상:</strong> 전자기기, 지갑, 신분증
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          고가품 및 중요 물품은 반드시 보안 검수를 거쳐야 인계가 진행됩니다.
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

      {/* 검수 목록 */}
      {itemsNeedingCheck.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            검수 대기 중인 인계가 없습니다.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {itemsNeedingCheck.map((handover) => {
            const item = foundItems.get(handover.foundId);
            if (!item) return null;

            return (
              <div
                key={handover.id}
                style={{
                  border: '2px solid #9933ff',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f5ff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: '#9933ff',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '8px',
                    }}>
                      🔒 검수 필요
                    </span>
                    <StatusBadge status={handover.status} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#999' }}>
                    요청: {formatDateTime(handover.createdAt)}
                  </div>
                </div>

                {/* 인계 정보 */}
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

                {/* 습득물 정보 */}
                <div style={{ 
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '2px solid #ff9900',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#ff9900',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}>
                    {item.category}
                  </div>
                  <h4 style={{ margin: '0 0 8px 0' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                    {item.description}
                  </p>
                  <div style={{ fontSize: '13px', color: '#999' }}>
                    습득: {formatDateTime(item.foundAt)} | 📍 {item.foundPlace}
                    <br />
                    보관: {item.storageLocation}
                  </div>
                </div>

                {/* 검수 체크리스트 */}
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#fff4e6',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    ✓ 검수 체크리스트
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    □ 물품의 상태가 양호한가?
                    <br />
                    □ 개인정보가 포함되어 있는가?
                    <br />
                    □ 분실자 확인이 가능한가?
                    <br />
                    □ 고가품인 경우 가치를 확인했는가?
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/handover/${handover.id}`)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    상세 보기
                  </button>
                  <button
                    onClick={() => handleVerify(handover.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#9933ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓ 검수 완료
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
