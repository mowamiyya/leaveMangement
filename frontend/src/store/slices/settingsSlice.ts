import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'react-toastify'

interface UISettings {
  theme: 'light' | 'dark'
  toastPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  toastDuration: number
}

interface SettingsState {
  uiSettings: UISettings
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  uiSettings: {
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    toastPosition: (localStorage.getItem('toastPosition') as any) || 'top-right',
    toastDuration: parseInt(localStorage.getItem('toastDuration') || '3000'),
  },
  loading: false,
  error: null,
}

// Apply theme to document
const applyTheme = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

// Apply toast settings
const applyToastSettings = (position: string, duration: number) => {
  localStorage.setItem('toastPosition', position)
  localStorage.setItem('toastDuration', duration.toString())
}

// Initialize theme on load - must happen immediately
if (typeof window !== 'undefined') {
  // Apply theme synchronously before React renders
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
  applyTheme(savedTheme)
}

export const fetchSettingsAsync = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/settings')
      return response.data?.uiSettings || initialState.uiSettings
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

export const saveSettingsAsync = createAsyncThunk(
  'settings/save',
  async (uiSettings: UISettings, { rejectWithValue }) => {
    try {
      await axios.put('/api/settings', { uiSettings })
      applyTheme(uiSettings.theme)
      applyToastSettings(uiSettings.toastPosition, uiSettings.toastDuration)
      toast.success('Settings saved successfully!')
      return uiSettings
    } catch (error: any) {
      toast.error('Failed to save settings')
      return rejectWithValue(error.response?.data?.message || 'Failed to save settings')
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.uiSettings.theme = action.payload
      applyTheme(action.payload)
    },
    setToastPosition: (state, action: PayloadAction<string>) => {
      state.uiSettings.toastPosition = action.payload as any
      applyToastSettings(action.payload, state.uiSettings.toastDuration)
    },
    setToastDuration: (state, action: PayloadAction<number>) => {
      state.uiSettings.toastDuration = action.payload
      applyToastSettings(state.uiSettings.toastPosition, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettingsAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettingsAsync.fulfilled, (state, action) => {
        state.loading = false
        state.uiSettings = { ...state.uiSettings, ...action.payload }
        applyTheme(state.uiSettings.theme)
        applyToastSettings(state.uiSettings.toastPosition, state.uiSettings.toastDuration)
      })
      .addCase(fetchSettingsAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(saveSettingsAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveSettingsAsync.fulfilled, (state, action) => {
        state.loading = false
        state.uiSettings = action.payload
      })
      .addCase(saveSettingsAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setTheme, setToastPosition, setToastDuration } = settingsSlice.actions
export default settingsSlice.reducer
