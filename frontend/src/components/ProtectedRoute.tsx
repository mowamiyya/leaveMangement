import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import Loader from './Loader'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ('STUDENT' | 'TEACHER' | 'ADMIN')[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return <Loader fullScreen text="Loading..." />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'TEACHER' ? '/teacher/dashboard' : '/admin/dashboard'
    return <Navigate to={redirectPath} />
  }

  return <>{children}</>
}

export default ProtectedRoute
