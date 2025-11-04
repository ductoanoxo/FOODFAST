import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersPage from './pages/Users/UsersPage';
import RestaurantsPage from './pages/Restaurants/RestaurantsPage';
import OrdersPage from './pages/Orders/OrdersPage';
import DronesPage from './pages/Drones/DronesPage';
import AssignmentDashboard from './pages/Assignment/AssignmentDashboard';
import FleetMap from './pages/Fleet/FleetMap';
import RefundsPage from './pages/Refunds/RefundsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

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
          <Route path="/users" element={<UsersPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/drones" element={<DronesPage />} />
          <Route path="/assignment" element={<AssignmentDashboard />} />
          <Route path="/fleet-map" element={<FleetMap />} />
          <Route path="/refunds" element={<RefundsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
