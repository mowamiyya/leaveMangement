import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import leaveReducer from './slices/leaveSlice'
import dashboardReducer from './slices/dashboardSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leave: leaveReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
