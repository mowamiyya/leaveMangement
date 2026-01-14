import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { LayoutDashboard, History, Network, User, Settings, LogOut } from 'lucide-react'

interface StudentLayoutProps {
  children: React.ReactNode
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/my-leaves', icon: History, label: 'My Leaves' },
    { path: '/student/my-chart', icon: Network, label: 'My Chart' },
    { path: '/student/profile', icon: User, label: 'Profile' },
    { path: '/student/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Leave Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Student Portal</p>
          </div>
          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    isActive ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-r-2 border-indigo-600 dark:border-indigo-400' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-2 px-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  )
}

export default StudentLayout
