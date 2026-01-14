import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

interface DashboardStats {
  departments: number
  classes: number
  teachers: number
  students: number
  pendingLeaves?: number
  approvedLeaves?: number
  rejectedLeaves?: number
  totalLeaves?: number
}

interface DashboardState {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
}

export const fetchDashboardStatsAsync = createAsyncThunk(
  'dashboard/fetchStats',
  async (role: 'STUDENT' | 'TEACHER' | 'ADMIN', { rejectWithValue }) => {
    try {
      if (role === 'ADMIN') {
        // Fetch admin stats
        const [deptsRes, teachersRes, studentsRes] = await Promise.all([
          axios.get('/api/admin/departments'),
          axios.get('/api/admin/teachers'),
          axios.get('/api/admin/students'),
        ])
        
        // Fetch classes separately to handle potential 403 error
        let classesCount = 0
        try {
          console.log('[Dashboard] Attempting to fetch classes from /api/admin/classes')
          console.log('[Dashboard] Auth token:', axios.defaults.headers.common['Authorization'] ? 'Present' : 'Missing')
          const classesRes = await axios.get('/api/admin/classes', {
            headers: {
              'Authorization': axios.defaults.headers.common['Authorization']
            }
          })
          classesCount = classesRes.data.length
          console.log('[Dashboard] Successfully fetched classes:', classesCount)
        } catch (classesError: any) {
          console.error('[Dashboard] Failed to fetch classes:', classesError)
          console.error('[Dashboard] Error status:', classesError.response?.status)
          console.error('[Dashboard] Error data:', classesError.response?.data)
          console.error('[Dashboard] Error headers:', classesError.response?.headers)
          classesCount = 0
        }
        
        return {
          departments: deptsRes.data.length,
          classes: classesCount,
          teachers: teachersRes.data.length,
          students: studentsRes.data.length,
        }
      } else {
        // Fetch student/teacher stats
        const response = await axios.get('/api/dashboard/stats')
        return response.data
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load dashboard stats'
      if (role !== 'ADMIN') {
        toast.error(message)
      }
      return rejectWithValue(message)
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearStats: (state) => {
      state.stats = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearStats, clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
