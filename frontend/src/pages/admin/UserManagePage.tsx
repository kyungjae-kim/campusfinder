import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import type { User } from '@/types/auth.types';
import Loading from '@/components/common/Loading';
import { formatDateTime } from '@/utils/formatters';

export default function UserManagePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // User service에서 사용자 목록을 가져와야 하지만, 여기서는 시뮬레이션
      // 실제로는 user-service API를 호출해야 함
      setUsers([]);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: number) => {
    if (!confirm('이 사용자를 정지하시겠습니까?')) return;

    try {
      await adminApi.blockUser(userId);
      await fetchUsers();
      alert('사용자가 정지되었습니다.');
    } catch (err: any) {
      alert(err.response?.data?.message || '정지 처리에 실패했습니다.');
    }
  };

  const handleUnblockUser = async (userId: number) => {
    if (!confirm('이 사용자의 정지를 해제하시겠습니까?')) return;

    try {
      await adminApi.unblockUser(userId);
      await fetchUsers();
      alert('정지가 해제되었습니다.');
    } catch (err: any) {
      alert(err.response?.data?.message || '해제 처리에 실패했습니다.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = 
      filter === 'ALL' ||
      (filter === 'ACTIVE' && user.status === 'ACTIVE') ||
      (filter === 'BLOCKED' && user.status === 'BLOCKED');

    const matchesSearch = 
      searchTerm === '' ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const blockedCount = users.filter(u => u.status === 'BLOCKED').length;

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px' }}>
          ← 대시보드
        </button>
        <h1 style={{ display: 'inline', marginLeft: '10px' }}>사용자 관리</h1>
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
          border: '2px solid #0066cc',
          borderRadius: '8px',
          backgroundColor: '#f0f7ff',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            전체 사용자
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>
            {users.length}
          </div>
        </div>
        <div style={{
          padding: '20px',
          border: '2px solid #00cc66',
          borderRadius: '8px',
          backgroundColor: '#f0fff4',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            활성 사용자
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00cc66' }}>
            {activeCount}
          </div>
        </div>
        <div style={{
          padding: '20px',
          border: '2px solid #ff3333',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            정지된 사용자
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff3333' }}>
            {blockedCount}
          </div>
        </div>
      </div>

      {/* 검색 & 필터 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="사용자 검색 (아이디 또는 닉네임)"
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
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
        <button
          onClick={() => setFilter('ACTIVE')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'ACTIVE' ? '#00cc66' : 'white',
            color: filter === 'ACTIVE' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          활성 ({activeCount})
        </button>
        <button
          onClick={() => setFilter('BLOCKED')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'BLOCKED' ? '#ff3333' : 'white',
            color: filter === 'BLOCKED' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          정지 ({blockedCount})
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

      {/* 사용자 목록 */}
      {filteredUsers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
          </p>
        </div>
      ) : (
        <div style={{ 
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>아이디</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>닉네임</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>역할</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>소속</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>상태</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>가입일</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>#{user.id}</td>
                  <td style={{ padding: '12px' }}>{user.username}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.nickname}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: getRoleColor(user.role),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{getAffiliationLabel(user.affiliation)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: user.status === 'ACTIVE' ? '#e6fff2' : '#ffe6e6',
                      color: user.status === 'ACTIVE' ? '#00cc66' : '#ff3333',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                      {user.status === 'ACTIVE' ? '활성' : '정지'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {user.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleBlockUser(user.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ff3333',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        정지
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblockUser(user.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#00cc66',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        해제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 역할별 색상
function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    LOSER: '#0066cc',
    FINDER: '#00cc66',
    OFFICE: '#ff9900',
    SECURITY: '#9933ff',
    ADMIN: '#cc0000',
    COURIER: '#00cccc',
  };
  return colors[role] || '#666';
}

// 역할 레이블
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    LOSER: '분실자',
    FINDER: '습득자',
    OFFICE: '관리실',
    SECURITY: '보안',
    ADMIN: '관리자',
    COURIER: '배송',
  };
  return labels[role] || role;
}

// 소속 레이블
function getAffiliationLabel(affiliation: string): string {
  const labels: Record<string, string> = {
    STUDENT: '학생',
    STAFF: '교직원',
    EXTERNAL: '외부',
  };
  return labels[affiliation] || affiliation;
}
