import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';

// Lost (분실 신고)
import LostItemCreatePage from './pages/lost/LostItemCreatePage';
import LostItemListPage from './pages/lost/LostItemListPage';
import LostItemDetailPage from './pages/lost/LostItemDetailPage';

// Found (습득물)
import FoundItemCreatePage from './pages/found/FoundItemCreatePage';
import FoundItemListPage from './pages/found/FoundItemListPage';
import FoundItemDetailPage from './pages/found/FoundItemDetailPage';

// Matching & Handover
import MatchingListPage from './pages/matching/MatchingListPage';
import HandoverRequestPage from './pages/handover/HandoverRequestPage';
import MyHandoverListPage from './pages/handover/MyHandoverListPage';
import HandoverInboxPage from './pages/handover/HandoverInboxPage';
import HandoverDetailPage from './pages/handover/HandoverDetailPage';

// Office
import OfficeQueuePage from './pages/office/OfficeQueuePage';
import StorageManagePage from './pages/office/StorageManagePage';

// Security
import SecurityInspectionPage from './pages/security/SecurityInspectionPage';
import ApprovalManagePage from './pages/security/ApprovalManagePage';

// Admin
import ReportManagePage from './pages/admin/ReportManagePage';
import UserManagePage from './pages/admin/UserManagePage';
import StatisticsPage from './pages/admin/StatisticsPage';

// Courier
import DeliveryManagePage from './pages/courier/DeliveryManagePage';

import './App.css';
import type { UserRole } from './types/common.types';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 보호된 라우트 */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* 분실 신고 - LOSER, ADMIN만 등록 가능 */}
        <Route path="/lost/create" element={<RoleProtectedRoute allowedRoles={['LOSER', 'ADMIN']}><LostItemCreatePage /></RoleProtectedRoute>} />
        <Route path="/lost/list" element={<PrivateRoute><LostItemListPage /></PrivateRoute>} />
        <Route path="/lost/:id" element={<PrivateRoute><LostItemDetailPage /></PrivateRoute>} />

        {/* 습득물 - FINDER, OFFICE, ADMIN만 등록 가능 */}
        <Route path="/found/create" element={<RoleProtectedRoute allowedRoles={['FINDER', 'OFFICE', 'ADMIN']}><FoundItemCreatePage /></RoleProtectedRoute>} />
        <Route path="/found/list" element={<PrivateRoute><FoundItemListPage /></PrivateRoute>} />
        <Route path="/found/:id" element={<PrivateRoute><FoundItemDetailPage /></PrivateRoute>} />

        {/* 매칭 */}
        <Route path="/matching" element={<PrivateRoute><MatchingListPage /></PrivateRoute>} />

        {/* 인계 - COURIER는 요청 생성 불가 */}
        <Route path="/handover/request" element={<RoleProtectedRoute allowedRoles={['LOSER', 'FINDER', 'OFFICE', 'SECURITY', 'ADMIN']}><HandoverRequestPage /></RoleProtectedRoute>} />
        <Route path="/handover/my-requests" element={<PrivateRoute><MyHandoverListPage /></PrivateRoute>} />
        <Route path="/handover/inbox" element={<PrivateRoute><HandoverInboxPage /></PrivateRoute>} />
        <Route path="/handover/:id" element={<PrivateRoute><HandoverDetailPage /></PrivateRoute>} />

        {/* 관리실 (OFFICE) */}
        <Route path="/office/queue" element={<RoleProtectedRoute allowedRoles={['OFFICE', 'ADMIN']}><OfficeQueuePage /></RoleProtectedRoute>} />
        <Route path="/office/storage" element={<RoleProtectedRoute allowedRoles={['OFFICE', 'ADMIN']}><StorageManagePage /></RoleProtectedRoute>} />
          <Route path="/office/approval" element={<RoleProtectedRoute allowedRoles={['OFFICE', 'ADMIN']}><ApprovalManagePage /></RoleProtectedRoute>} />

          {/* 보안 (SECURITY) */}
          <Route path="/security/inspection" element={<RoleProtectedRoute allowedRoles={['SECURITY', 'ADMIN']}><SecurityInspectionPage /></RoleProtectedRoute>} />

        {/* 관리자 (ADMIN) */}
        <Route path="/admin/reports" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'OFFICE', 'SECURITY']}><ReportManagePage /></RoleProtectedRoute>} />
        <Route path="/admin/users" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><UserManagePage /></RoleProtectedRoute>} />
        <Route path="/admin/statistics" element={<RoleProtectedRoute allowedRoles={['ADMIN']}><StatisticsPage /></RoleProtectedRoute>} />

        {/* 배송 (COURIER) */}
        <Route path="/courier/delivery" element={<RoleProtectedRoute allowedRoles={['COURIER', 'ADMIN']}><DeliveryManagePage /></RoleProtectedRoute>} />
        
        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// 인증 보호 컴포넌트
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth-token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Header />
      {children}
    </>
  );
}

// 역할별 접근 제어 컴포넌트
function RoleProtectedRoute({ 
  allowedRoles, 
  children 
}: { 
  allowedRoles: UserRole[]; 
  children: React.ReactNode 
}) {
  const token = localStorage.getItem('auth-token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // 권한 체크
  let hasPermission = false;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      hasPermission = allowedRoles.includes(user.role);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return <Navigate to="/login" replace />;
    }
  }
  
  if (!hasPermission) {
    // 권한이 없으면 대시보드로 리다이렉트
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default App;
