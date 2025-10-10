import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MainLayout from './components/Layout/MainLayout'
import LoginPage from './pages/Auth/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import UsersPage from './pages/Users/UsersPage'
import RestaurantsPage from './pages/Restaurants/RestaurantsPage'
import OrdersPage from './pages/Orders/OrdersPage'
import DronesPage from './pages/Drones/DronesPage'

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/drones" element={<DronesPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
