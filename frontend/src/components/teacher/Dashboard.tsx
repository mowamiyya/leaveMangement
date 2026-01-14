import { useEffect, useState } from 'react'
import axios from 'axios'
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppSelector } from '../../store/hooks'

const CustomTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="px-3 py-2 rounded-lg shadow-lg border"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#4b5563' : '#d1d5db',
          color: isDark ? '#f3f4f6' : '#1f2937'
        }}
      >
        <p className="font-semibold mb-1" style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
          {payload[0].name}
        </p>
        <p className="text-sm" style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>
          Value: <span className="font-medium" style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

interface DashboardStats {
  totalLeaves: number
  pendingLeaves: number
  approvedLeaves: number
  rejectedLeaves: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { uiSettings } = useAppSelector((state) => state.settings)
  const isDark = uiSettings.theme === 'dark'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats')
      setStats(response.data)
    } catch (error: any) {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const cards = [
    { label: 'Leaves Pending Approval', value: stats?.pendingLeaves || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Leaves Approved', value: stats?.approvedLeaves || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Leaves Rejected', value: stats?.rejectedLeaves || 0, icon: XCircle, color: 'bg-red-500' },
    { label: 'Total Leaves', value: stats?.totalLeaves || 0, icon: FileText, color: 'bg-blue-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Leave Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pending', value: stats?.pendingLeaves || 0, color: '#f59e0b' },
                  { name: 'Approved', value: stats?.approvedLeaves || 0, color: '#10b981' },
                  { name: 'Rejected', value: stats?.rejectedLeaves || 0, color: '#ef4444' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke={isDark ? '#1f2937' : '#ffffff'}
                strokeWidth={2}
              >
                {[
                  { name: 'Pending', value: stats?.pendingLeaves || 0, color: '#f59e0b' },
                  { name: 'Approved', value: stats?.approvedLeaves || 0, color: '#10b981' },
                  { name: 'Rejected', value: stats?.rejectedLeaves || 0, color: '#ef4444' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#1f2937' : '#ffffff'} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip isDark={isDark} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Leave Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Pending', value: stats?.pendingLeaves || 0, color: '#f59e0b' },
                { name: 'Approved', value: stats?.approvedLeaves || 0, color: '#10b981' },
                { name: 'Rejected', value: stats?.rejectedLeaves || 0, color: '#ef4444' },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? '#374151' : '#e5e7eb'} 
                strokeWidth={1}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 12, fontWeight: 500 }}
                style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
                axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 12, fontWeight: 500 }}
                style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
                axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
              />
              <Tooltip 
                content={<CustomTooltip isDark={isDark} />}
                cursor={false}
              />
              <Legend 
                wrapperStyle={{ color: isDark ? '#f3f4f6' : '#1f2937', fontSize: 12, fontWeight: 500 }}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                cursor="default"
                isAnimationActive={false}
                activeBar={false}
              >
                {[
                  { name: 'Pending', value: stats?.pendingLeaves || 0, color: '#f59e0b' },
                  { name: 'Approved', value: stats?.approvedLeaves || 0, color: '#10b981' },
                  { name: 'Rejected', value: stats?.rejectedLeaves || 0, color: '#ef4444' },
                ].map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={isDark ? '#1f2937' : '#ffffff'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
