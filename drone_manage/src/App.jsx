import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MainLayout from './components/Layout/MainLayout'
import LoginPage from './pages/Auth/LoginPage'
import MapPage from './pages/Map/MapPage'
import DronesPage from './pages/Drones/DronesPage'
import MissionsPage from './pages/Missions/MissionsPage'

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/drones" element={<DronesPage />} />
          <Route path="/missions" element={<MissionsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
