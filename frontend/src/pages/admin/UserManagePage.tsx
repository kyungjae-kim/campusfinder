import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import Loading from '@/components/common/Loading';

interface User {
  id: number;
  username: string;
  nickname: string;
  role: string;
  status: 'ACTIVE' | 'BLOCKED';
  affiliation: string;
  createdAt: string;
}

export default function UserManagePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId: number) => {
    if (!confirm('이 사용자를 정지하시겠습니까?')) return;

    setProcessingId(userId);
    try {
      await adminApi.blockUser(userId);
      alert('사용자가 정지되었습니다.');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnblock = async (userId: number) => {
    if (!confirm('이 사용자의 정지를 해제하시겠습니까?')) return;

    setProcessingId(userId);
    try {
      await adminApi.unblockUser(userId);
      alert('사용자 정지가 해제되었습니다.');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'ALL') return true;
    return u.status === filter;
  });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      LOSER: 'primary',
      FINDER: 'success',
      OFFICE: 'warning',
      SECURITY: 'danger',
      ADMIN: 'dark',
      COURIER: 'info',
    };
    return colors[role] || 'secondary';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      LOSER: '분실자',
      FINDER: '습득자',
      OFFICE: '관리실',
      SECURITY: '보안',
      ADMIN: '관리자',
      COURIER: '배송',
    };
    return labels[role] || role;
  };

  const getAffiliationLabel = (affiliation: string) => {
    const labels: Record<string, string> = {
      STUDENT: '학생',
      STAFF: '교직원',
      EXTERNAL: '외부',
    };
    return labels[affiliation] || affiliation;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-vh-100 bg-light">
      {/* 헤더 */}
      <nav className="navbar navbar-light bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <button 
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            대시보드로 돌아가기
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {/* 타이틀 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-people text-danger me-2"></i>
            사용자 관리
          </h2>
          <p className="text-muted mb-0">사용자를 조회하고 정지/해제를 관리하세요</p>
        </div>

        {/* 필터 & 통계 */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-8">
            <ul className="nav nav-pills">
              {[
                { key: 'ALL', label: '전체', icon: 'bi-list' },
                { key: 'ACTIVE', label: '활성', icon: 'bi-check-circle' },
                { key: 'BLOCKED', label: '정지', icon: 'bi-x-circle' },
              ].map(({ key, label, icon }) => (
                <li key={key} className="nav-item">
                  <button
                    className={`nav-link ${filter === key ? 'active' : ''}`}
                    onClick={() => setFilter(key as any)}
                  >
                    <i className={`${icon} me-1`}></i>
                    {label}
                    <span className="badge bg-light text-dark ms-2">
                      {key === 'ALL' ? users.length :
                       users.filter(u => u.status === key).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">전체 사용자</span>
                  <h4 className="mb-0 fw-bold">{users.length}명</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사용자 목록 */}
        {filteredUsers.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <i className="bi bi-people fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted mb-3">사용자가 없습니다</h5>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>닉네임</th>
                    <th>아이디</th>
                    <th>역할</th>
                    <th>소속</th>
                    <th>상태</th>
                    <th>가입일</th>
                    <th className="text-center">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={user.status === 'BLOCKED' ? 'table-danger' : ''}>
                      <td>
                        <span className="badge bg-light text-dark">#{user.id}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2 bg-${getRoleColor(user.role)}`}
                            style={{ width: '32px', height: '32px', fontSize: '14px' }}
                          >
                            {user.nickname.charAt(0).toUpperCase()}
                          </div>
                          <strong>{user.nickname}</strong>
                        </div>
                      </td>
                      <td>{user.username}</td>
                      <td>
                        <span className={`badge bg-${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {getAffiliationLabel(user.affiliation)}
                        </span>
                      </td>
                      <td>
                        {user.status === 'ACTIVE' ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            활성
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            <i className="bi bi-x-circle me-1"></i>
                            정지
                          </span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="text-center">
                        {user.role !== 'ADMIN' && (
                          <>
                            {user.status === 'ACTIVE' ? (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleBlock(user.id)}
                                disabled={processingId === user.id}
                              >
                                {processingId === user.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <i className="bi bi-ban me-1"></i>
                                    정지
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleUnblock(user.id)}
                                disabled={processingId === user.id}
                              >
                                {processingId === user.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    해제
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="alert alert-info d-flex align-items-start mt-4" role="alert">
          <i className="bi bi-info-circle-fill me-2 flex-shrink-0"></i>
          <div className="small">
            <strong>사용자 정지 안내</strong><br />
            정지된 사용자는 글 등록, 인계 요청, 메시지 전송이 불가능합니다.
            관리자는 정지할 수 없습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
