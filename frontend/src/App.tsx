import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { useAppSelector } from './store/hooks'
import ProtectedRoute from './components/ProtectedRoute'
import { useEffect } from 'react'

function AppRoutes() {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'TEACHER' ? '/teacher/dashboard' : '/admin/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'TEACHER' ? '/teacher/dashboard' : '/admin/dashboard'} /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'TEACHER' ? '/teacher/dashboard' : '/admin/dashboard'} /> : <ForgotPassword />} />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  const { uiSettings } = useAppSelector((state) => state.settings)

  useEffect(() => {
    // Apply theme whenever it changes
    const root = document.documentElement
    if (uiSettings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [uiSettings.theme])

  return (
    <Router>
      <AppRoutes />
      <ToastContainer 
        position={uiSettings.toastPosition as any} 
        autoClose={uiSettings.toastDuration}
        theme={uiSettings.theme === 'dark' ? 'dark' : 'light'}
      />
    </Router>
  )
}

export default App
