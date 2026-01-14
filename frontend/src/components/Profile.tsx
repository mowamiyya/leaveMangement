import { useEffect, useState } from 'react'
import { useAppSelector } from '../store/hooks'
import { User, Mail, Shield, Calendar, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

interface DashboardStats {
  totalLeaves: number
  pendingLeaves: number
  approvedLeaves: number
  rejectedLeaves: number
}

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats')
      setStats(response.data)
    } catch (error: any) {
      // Silently fail - stats are optional
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role?: string) => {
    const roleConfig = {
      ADMIN: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Admin' },
      TEACHER: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Teacher' },
      STUDENT: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Student' },
    }
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.STUDENT
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h2>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">User Role</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 md:col-span-2">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">User ID</p>
                <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-100 mt-1 break-all">{user?.userId}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Leave Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Leave Statistics</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your leave overview</p>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Leaves</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalLeaves}</span>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingLeaves}</span>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedLeaves}</span>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejectedLeaves}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leave data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
