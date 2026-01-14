import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

interface Leave {
  leaveId: string
  applicantId: string
  applicantName: string
  applicantRole: string
  fromDate: string
  toDate: string
  subject: string
  reason: string
  status: string
  rejectionReason?: string
  reportedTo?: string
  createdAt: string
}

interface LeaveState {
  leaves: Leave[]
  loading: boolean
  error: string | null
}

const initialState: LeaveState = {
  leaves: [],
  loading: false,
  error: null,
}

export const fetchLeavesAsync = createAsyncThunk(
  'leave/fetchLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/leaves/my-leaves')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves')
    }
  }
)

export const applyLeaveAsync = createAsyncThunk(
  'leave/applyLeave',
  async (leaveData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/leaves/apply', leaveData)
      toast.success('Leave application submitted successfully!')
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to apply leave'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const approveLeaveAsync = createAsyncThunk(
  'leave/approveLeave',
  async ({ leaveId, action, rejectionReason }: { leaveId: string; action: string; rejectionReason?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/leaves/${leaveId}/approve`, { action, rejectionReason })
      toast.success(`Leave ${action.toLowerCase()}d successfully!`)
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to process leave'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearLeaves: (state) => {
      state.leaves = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeavesAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeavesAsync.fulfilled, (state, action) => {
        state.loading = false
        state.leaves = action.payload
        state.error = null
      })
      .addCase(fetchLeavesAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(applyLeaveAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(applyLeaveAsync.fulfilled, (state, action) => {
        state.loading = false
        state.leaves.push(action.payload)
        state.error = null
      })
      .addCase(applyLeaveAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(approveLeaveAsync.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(leave => leave.leaveId === action.payload.leaveId)
        if (index !== -1) {
          state.leaves[index] = action.payload
        }
      })
  },
})

export const { clearLeaves, clearError } = leaveSlice.actions
export default leaveSlice.reducer
