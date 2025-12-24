import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import type { RegisterRequest } from '@/types/auth.types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    password: '',
    nickname: '',
    role: 'LOSER',
    affiliation: 'STUDENT',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register(formData);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>회원가입</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>아이디:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>비밀번호:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>닉네임:</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>역할:</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="LOSER">분실자</option>
            <option value="FINDER">습득자</option>
            <option value="OFFICE">관리실</option>
            <option value="SECURITY">보안</option>
            <option value="COURIER">배송</option>
          </select>
        </div>
        
        <div>
          <label>소속:</label>
          <select
            value={formData.affiliation}
            onChange={(e) => setFormData({ ...formData, affiliation: e.target.value as any })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="STUDENT">학생</option>
            <option value="STAFF">교직원</option>
              <option value="EXTERNAL">외부</option>
          </select>
        </div>
        
        <div>
          <label>전화번호:</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            placeholder="010-1234-5678"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>이메일:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          {loading ? '등록 중...' : '회원가입'}
        </button>
        
        <button 
          type="button"
          onClick={() => navigate('/login')}
          style={{ padding: '10px', cursor: 'pointer', background: '#6c757d' }}
        >
          로그인으로 돌아가기
        </button>
      </form>
    </div>
  );
}
