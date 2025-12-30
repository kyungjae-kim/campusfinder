import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message ?? '';

        // 1️⃣ 401 중에서도 "세션/토큰 문제"만 전역 처리
        if (status === 401) {
            const isLoginRequest =
                error.config?.url?.includes('/auth/login');

            const isInvalidCredential =
                message.includes('아이디') ||
                message.includes('비밀번호');

            if (!isLoginRequest && !isInvalidCredential) {
                // 토큰 문제로 판단
                localStorage.removeItem('auth-token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

