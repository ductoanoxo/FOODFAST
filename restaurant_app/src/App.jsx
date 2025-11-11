import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import OrdersPage from './pages/Orders/OrdersPage';
import MenuPage from './pages/Menu/MenuPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import ReportsPage from './pages/Reports/ReportsPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import VouchersPage from './pages/Vouchers/VouchersPage';
import PromotionsPage from './pages/Promotions/PromotionsPage';
import { initSocket, disconnectSocket } from './utils/socket';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    }

    return () => {
      if (isAuthenticated) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated]);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
