import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setTheme, setToastPosition, setToastDuration } from '../store/slices/settingsSlice'
import { Palette, Bell, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button } from './ui/button'

const Settings = () => {
  const dispatch = useAppDispatch()
  const { uiSettings } = useAppSelector((state) => state.settings)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleThemeChange = (theme: 'light' | 'dark') => {
    dispatch(setTheme(theme))
  }

  const handleToastPositionChange = (position: string) => {
    dispatch(setToastPosition(position as any))
  }

  const handleToastDurationChange = (duration: number) => {
    dispatch(setToastDuration(duration))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    try {
      await axios.put('/api/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Settings</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
              <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">UI Settings</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Customize appearance</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    uiSettings.theme === 'light'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">☀️</div>
                    <div className={`text-sm font-medium ${uiSettings.theme === 'light' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      Light
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    uiSettings.theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">🌙</div>
                    <div className={`text-sm font-medium ${uiSettings.theme === 'dark' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      Dark
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3">
              <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Notification Settings</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toast preferences</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Toast Position
              </label>
              <select
                value={uiSettings.toastPosition}
                onChange={(e) => handleToastPositionChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Toast Duration (milliseconds)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={uiSettings.toastDuration}
                  onChange={(e) => handleToastDurationChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={uiSettings.toastDuration}
                  onChange={(e) => handleToastDurationChange(parseInt(e.target.value))}
                  min="1000"
                  max="10000"
                  step="500"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current: {uiSettings.toastDuration}ms
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
              <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Change Password</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
            </div>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={changingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
