import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout
import MainLayout from './components/Layout/MainLayout'
import AuthLayout from './components/Layout/AuthLayout'

// Pages
import HomePage from './pages/Home/HomePage'
import MenuPage from './pages/Menu/MenuPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import StorePage from './pages/Store/StorePage'
import RestaurantDetailPage from './pages/Store/RestaurantDetailPage'
import ProductDetailPage from './pages/Product/ProductDetailPage'
import CartPage from './pages/Cart/CartPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import VNPayReturn from './pages/Checkout/VNPayReturn'
import OrderTrackingPage from './pages/OrderTracking/OrderTrackingPage'
import ProfilePage from './pages/Profile/ProfilePage'
import OrderHistoryPage from './pages/Profile/OrderHistoryPage'
import MyReviews from './pages/Profile/MyReviews'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'

// Protected Route
import ProtectedRoute from './components/Route/ProtectedRoute'

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/stores" element={<StorePage />} />
          <Route path="/stores/:id" element={<RestaurantDetailPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/vnpay/return" element={<VNPayReturn />} />
            <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/my-reviews" element={<MyReviews />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
