# 캠퍼스 분실물 플랫폼 프론트엔드 설치 가이드

## 📦 라이브러리 설치

frontend 폴더에서 다음 명령어를 실행하세요:

```bash
cd frontend
npm install react-router-dom axios zustand @tanstack/react-query date-fns
npm install -D @types/node
```

## 🚀 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 🔧 환경 변수 설정

`.env.development` 파일이 이미 있습니다. API URL을 확인하세요:

```env
VITE_API_URL=http://localhost:8080
```

## 📋 현재 구현된 기능

### ✅ 완료
- 로그인/회원가입 페이지
- 대시보드 (역할별 메뉴)
- API 클라이언트 설정
- TypeScript 타입 정의
- 라우팅 설정

### 🚧 구현 예정
- 분실 신고 CRUD
- 습득물 CRUD
- 매칭 후보 조회
- 인계 프로세스
- 채팅 기능
- 알림 시스템
- 관리자 기능

## 📁 폴더 구조

```
frontend/
├── src/
│   ├── api/              # API 호출 함수
│   │   ├── client.ts    # Axios 클라이언트
│   │   ├── auth.api.ts
│   │   ├── lost.api.ts
│   │   ├── found.api.ts
│   │   └── handover.api.ts
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── types/            # TypeScript 타입
│   │   ├── common.types.ts
│   │   ├── auth.types.ts
│   │   ├── lost.types.ts
│   │   ├── found.types.ts
│   │   └── handover.types.ts
│   ├── App.tsx           # 메인 앱 (라우터)
│   └── main.tsx
└── package.json
```

## 🔐 테스트 계정

백엔드 서버가 실행 중이면 회원가입 후 로그인하세요.

### 테스트 역할
- **LOSER**: 분실 신고
- **FINDER**: 습득물 등록
- **OFFICE**: 관리실 직원
- **SECURITY**: 보안 담당
- **ADMIN**: 시스템 관리자

## 📝 다음 단계

1. 백엔드 서버 실행 확인 (docker-compose up)
2. 프론트엔드 라이브러리 설치
3. 개발 서버 실행
4. 회원가입 → 로그인 테스트
5. 추가 페이지 구현 시작

## 🐛 문제 해결

### 포트 충돌
기본 포트 5173이 사용 중이면:
```bash
npm run dev -- --port 3000
```

### API 연결 실패
1. 백엔드 서버가 실행 중인지 확인
2. .env.development의 VITE_API_URL 확인
3. CORS 설정 확인 (api-gateway)

### 타입 에러
```bash
npm install -D @types/node
```
