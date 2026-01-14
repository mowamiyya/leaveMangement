import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

interface User {
  userId: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
}

// Load user from localStorage on init
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    initialState.user = JSON.parse(storedUser)
  } catch (e) {
    console.error('Failed to parse stored user', e)
  }
}

// Set axios default header if token exists
if (initialState.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`
}

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { accessToken, role, userId, name, email: userEmail } = response.data
      
      const userData: User = { userId, name, email: userEmail, role: role as 'STUDENT' | 'TEACHER' | 'ADMIN' }
      
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      toast.success('Login successful!')
      return { user: userData, token: accessToken }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (registrationData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', registrationData)
      toast.success('Registration successful! Please login.')
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      toast.info('Logged out successfully')
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
