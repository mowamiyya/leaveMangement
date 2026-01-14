import { useEffect, useState } from 'react'
import { Building2, GraduationCap, UserCheck, TrendingUp, Activity, BookOpen, UserCog } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchDashboardStatsAsync } from '../../store/slices/dashboardSlice'
import Loader from '../Loader'
import axios from 'axios'
import { toast } from 'react-toastify'

interface MasterDataStats {
  departments: number
  classes: number
  teachers: number
  students: number
  classTeachers: number
  totalLeaves: number
  pendingLeaves: number
}

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state) => state.dashboard)
  const { user } = useAppSelector((state) => state.auth)
  const { uiSettings } = useAppSelector((state) => state.settings)
  const [masterDataStats, setMasterDataStats] = useState<MasterDataStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const isDark = uiSettings.theme === 'dark'

  useEffect(() => {
    if (user) {
      dispatch(fetchDashboardStatsAsync(user.role))
      fetchMasterDataStats()
    }
  }, [dispatch, user])

  const fetchMasterDataStats = async () => {
    try {
      const [deptsRes, classesRes, teachersRes, studentsRes, classTeachersRes, leaveStatsRes] = await Promise.all([
        axios.get('/api/admin/departments'),
        axios.get('/api/admin/classes'),
        axios.get('/api/admin/teachers'),
        axios.get('/api/admin/students'),
        axios.get('/api/admin/class-teachers'),
        axios.get('/api/admin/leave-statistics').catch(() => ({ data: { totalLeaves: 0, pendingLeaves: 0 } })),
      ])
      
      setMasterDataStats({
        departments: deptsRes.data.length,
        classes: classesRes.data.length,
        teachers: teachersRes.data.length,
        students: studentsRes.data.length,
        classTeachers: classTeachersRes.data.length,
        totalLeaves: leaveStatsRes.data.totalLeaves || 0,
        pendingLeaves: leaveStatsRes.data.pendingLeaves || 0,
      })
    } catch (error: any) {
      toast.error('Failed to load master data statistics')
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats || !stats || !masterDataStats) {
    return <Loader text="Loading dashboard stats..." />
  }

  const cards = [
    { 
      label: 'Total Departments', 
      value: masterDataStats.departments, 
      icon: Building2, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'from-blue-900/20 to-blue-800/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%'
    },
    { 
      label: 'Total Classes', 
      value: masterDataStats.classes, 
      icon: GraduationCap, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      darkBgGradient: 'from-green-900/20 to-green-800/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: '+8%'
    },
    { 
      label: 'Total Teachers', 
      value: masterDataStats.teachers, 
      icon: UserCog, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      darkBgGradient: 'from-purple-900/20 to-purple-800/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: '+15%'
    },
    { 
      label: 'Total Students', 
      value: masterDataStats.students, 
      icon: UserCheck, 
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      darkBgGradient: 'from-orange-900/20 to-orange-800/20',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trend: '+22%'
    },
    { 
      label: 'Class Teachers', 
      value: masterDataStats.classTeachers, 
      icon: BookOpen, 
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      darkBgGradient: 'from-indigo-900/20 to-indigo-800/20',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      trend: '+5%'
    },
    { 
      label: 'Total Leaves', 
      value: masterDataStats.totalLeaves, 
      icon: Activity, 
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
      darkBgGradient: 'from-pink-900/20 to-pink-800/20',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-600 dark:text-pink-400',
      trend: '+18%'
    },
    { 
      label: 'Pending Leaves', 
      value: masterDataStats.pendingLeaves, 
      icon: TrendingUp, 
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      darkBgGradient: 'from-yellow-900/20 to-yellow-800/20',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      trend: '+3%'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Master data analytics and overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`group relative bg-gradient-to-br ${isDark ? card.darkBgGradient : card.bgGradient} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-transparent hover:border-opacity-50 overflow-hidden transform hover:-translate-y-1`}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {card.trend}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
