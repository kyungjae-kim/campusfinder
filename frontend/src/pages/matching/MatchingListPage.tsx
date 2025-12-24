import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { matchingApi } from '@/api/matching.api';
import { lostApi } from '@/api/lost.api';
import type { MatchingResponse } from '@/types/matching.types';
import type { LostItem } from '@/types/lost.types';
import Loading from '@/components/common/Loading';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, getCategoryLabel } from '@/utils/formatters';

export default function MatchingListPage() {
  const { lostId } = useParams<{ lostId: string }>();
  const navigate = useNavigate();
  
  const [lostItem, setLostItem] = useState<LostItem | null>(null);
  const [matches, setMatches] = useState<MatchingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lostId) {
      fetchData(parseInt(lostId));
    }
  }, [lostId]);

  const fetchData = async (id: number) => {
    try {
      setLoading(true);
      const [itemData, matchData] = await Promise.all([
        lostApi.getById(id),
        matchingApi.getMatchingForLost(id, 10),
      ]);
      setLostItem(itemData);
      setMatches(matchData);
      console.log(itemData);
      console.log(matchData);
    } catch (err: any) {
      setError(err.response?.data?.message || '매칭 후보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHandover = (foundId: number) => {
    if (!lostId) return;
    navigate(`/handover/request?lostId=${lostId}&foundId=${foundId}`);
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
          onClick={() => navigate(-1)}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/lost/${lostId}`)}>
          ← 분실 신고로 돌아가기
        </button>
      </div>

      {/* 분실 신고 정보 */}
      {lostItem && (
        <div style={{ 
          border: '2px solid #0066cc',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          backgroundColor: '#f0f7ff',
        }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
            내 분실 신고
          </h2>
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
            <span style={{ 
              padding: '4px 8px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              fontSize: '12px',
            }}>
              {getCategoryLabel(lostItem.category)}
            </span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                {lostItem.title}
              </h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                📍 {lostItem.lostPlace} | 🕐 {formatDateTime(lostItem.lostAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 매칭 후보 목록 */}
      <div>
        <h1 style={{ marginBottom: '20px' }}>
          매칭 후보 ({matches.length}개)
        </h1>

        {matches.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>
              😕 매칭되는 습득물이 없습니다.
            </p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              조금 더 기다려주세요. 새로운 습득물이 등록되면 알려드립니다!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {matches.map((match, index) => {
              const item = match.foundItem;
              if (!item) return null;

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: 'white',
                    position: 'relative',
                  }}
                >
                  {/* 순위 배지 */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: index < 3 ? '#fff' : '#666',
                  }}>
                    {index + 1}
                  </div>

                  {/* 점수 */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#e6f2ff',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#0066cc',
                    }}>
                      매칭도: {Math.round(match.score)}점
                    </span>
                  </div>

                  {/* 습득물 정보 */}
                  <div style={{ marginBottom: '12px' }}>
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

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                    {item.title}
                  </h3>

                  <p style={{ 
                    margin: '0 0 12px 0', 
                    color: '#666',
                    lineHeight: '1.5',
                  }}>
                    {item.description}
                  </p>

                  {/* 매칭 이유 */}
                  {match.reasons && match.reasons.length > 0 && (
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      marginBottom: '12px',
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#666' }}>
                        매칭 이유:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
                        {match.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
                    <span style={{ marginRight: '16px' }}>
                      📍 {item.foundPlace}
                    </span>
                    <span style={{ marginRight: '16px' }}>
                      🕐 {formatDateTime(item.foundAt)}
                    </span>
                    <span>
                      📦 {item.storageType === 'SELF' ? '직접보관' : 
                           item.storageType === 'OFFICE' ? '관리실' :
                           item.storageType === 'SECURITY' ? '보안실' : '보관함'}
                    </span>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigate(`/found/${item.id}`)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => handleRequestHandover(item.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#00cc66',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      인계 요청하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
