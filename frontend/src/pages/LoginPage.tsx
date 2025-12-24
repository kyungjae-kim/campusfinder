import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import type { LoginRequest } from '@/types/auth.types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      
      // 토큰 저장
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      // 대시보드로 이동
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>캠퍼스 분실물 플랫폼</h1>
      <h2>로그인</h2>
      
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
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
        
        <button 
          type="button"
          onClick={() => navigate('/register')}
          style={{ padding: '10px', cursor: 'pointer', background: '#6c757d' }}
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
