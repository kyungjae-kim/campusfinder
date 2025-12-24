import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

        {/* 분실 신고 */}
        <Route path="/lost/create" element={<PrivateRoute><LostItemCreatePage /></PrivateRoute>} />
        <Route path="/lost/list" element={<PrivateRoute><LostItemListPage /></PrivateRoute>} />
        <Route path="/lost/:id" element={<PrivateRoute><LostItemDetailPage /></PrivateRoute>} />
        <Route path="/lost/:lostId/matching" element={<PrivateRoute><MatchingListPage /></PrivateRoute>} />

        {/* 습득물 */}
        <Route path="/found/create" element={<PrivateRoute><FoundItemCreatePage /></PrivateRoute>} />
        <Route path="/found/list" element={<PrivateRoute><FoundItemListPage /></PrivateRoute>} />
        <Route path="/found/:id" element={<PrivateRoute><FoundItemDetailPage /></PrivateRoute>} />

        {/* 인계 */}
        <Route path="/handover/request" element={<PrivateRoute><HandoverRequestPage /></PrivateRoute>} />
        <Route path="/handover/my-requests" element={<PrivateRoute><MyHandoverListPage /></PrivateRoute>} />
        <Route path="/handover/inbox" element={<PrivateRoute><HandoverInboxPage /></PrivateRoute>} />
        <Route path="/handover/:id" element={<PrivateRoute><HandoverDetailPage /></PrivateRoute>} />

        {/* 관리실 (OFFICE) */}
        <Route path="/office/queue" element={<PrivateRoute><OfficeQueuePage /></PrivateRoute>} />
        <Route path="/office/storage" element={<PrivateRoute><StorageManagePage /></PrivateRoute>} />

        {/* 보안 (SECURITY) */}
        <Route path="/security/inspection" element={<PrivateRoute><SecurityInspectionPage /></PrivateRoute>} />
        <Route path="/security/approval" element={<PrivateRoute><ApprovalManagePage /></PrivateRoute>} />

        {/* 관리자 (ADMIN) */}
        <Route path="/admin/reports" element={<PrivateRoute><ReportManagePage /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><UserManagePage /></PrivateRoute>} />
        <Route path="/admin/statistics" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />

        {/* 배송 (COURIER) */}
        <Route path="/courier/delivery" element={<PrivateRoute><DeliveryManagePage /></PrivateRoute>} />
        
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
  
  return <>{children}</>;
}

export default App;
