import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import Loading from '@/components/common/Loading';

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'ALL'>('WEEK');

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      const now = new Date();
      endDate = now.toISOString();
      
      if (period === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString();
      } else if (period === 'MONTH') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = monthAgo.toISOString();
      }
      
      const data = await adminApi.getStatistics(startDate, endDate);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
            ← 대시보드
          </button>
          <h1 style={{ display: 'inline', marginLeft: '10px' }}>운영 통계</h1>
        </div>
      </div>

      {/* 기간 선택 */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setPeriod('WEEK')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            backgroundColor: period === 'WEEK' ? '#0066cc' : 'white',
            color: period === 'WEEK' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          최근 7일
        </button>
        <button
          onClick={() => setPeriod('MONTH')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            backgroundColor: period === 'MONTH' ? '#0066cc' : 'white',
            color: period === 'MONTH' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          최근 30일
        </button>
        <button
          onClick={() => setPeriod('ALL')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            backgroundColor: period === 'ALL' ? '#0066cc' : 'white',
            color: period === 'ALL' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
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

      {/* 핵심 지표 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '16px' }}>📊 핵심 지표</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <StatCard
            title="분실 신고"
            count={stats?.lostItemCount || 0}
            icon="📢"
            color="#0066cc"
          />
          <StatCard
            title="습득물"
            count={stats?.foundItemCount || 0}
            icon="🎉"
            color="#00cc66"
          />
          <StatCard
            title="인계 완료"
            count={stats?.completedHandoverCount || 0}
            icon="✅"
            color="#ff9900"
          />
          <StatCard
            title="진행 중인 인계"
            count={stats?.ongoingHandoverCount || 0}
            icon="🔄"
            color="#9933ff"
          />
        </div>
      </div>

      {/* 상세 통계 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '16px' }}>📈 상세 통계</h2>
        <div style={{ 
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>항목</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>수량</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>📢 분실 신고 (OPEN)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#0066cc' }}>
                  {stats?.openLostItemCount || 0}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>📢 분실 신고 (CLOSED)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#666' }}>
                  {stats?.closedLostItemCount || 0}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>🎉 습득물 (REGISTERED)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#00cc66' }}>
                  {stats?.registeredFoundItemCount || 0}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>🎉 습득물 (HANDED_OVER)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#666' }}>
                  {stats?.handedOverFoundItemCount || 0}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>📨 인계 요청 (대면)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                  {stats?.meetHandoverCount || 0}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>📨 인계 요청 (관리실)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                  {stats?.officeHandoverCount || 0}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px' }}>📨 인계 요청 (배송)</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                  {stats?.courierHandoverCount || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 성공률 */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>🎯 인계 성공률</h2>
        <div style={{ 
          padding: '30px',
          border: '2px solid #0066cc',
          borderRadius: '8px',
          backgroundColor: '#f0f7ff',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0066cc', marginBottom: '10px' }}>
            {stats?.lostItemCount > 0 
              ? Math.round((stats?.completedHandoverCount || 0) / stats.lostItemCount * 100)
              : 0}%
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>
            분실 신고 대비 인계 완료 비율
          </div>
          <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            (완료: {stats?.completedHandoverCount || 0} / 전체: {stats?.lostItemCount || 0})
          </div>
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
}

function StatCard({ title, count, icon, color }: StatCardProps) {
  return (
    <div style={{
      padding: '24px',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      backgroundColor: 'white',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '36px', fontWeight: 'bold', color }}>
        {count}
      </div>
    </div>
  );
}
