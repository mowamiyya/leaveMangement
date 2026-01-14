import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Mail, Key, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppSelector } from '../store/hooks'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { uiSettings } = useAppSelector((state) => state.settings)
  const isDark = uiSettings.theme === 'dark'
  const [method, setMethod] = useState<'current' | 'code'>('current')
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    confirmationCode: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email: formData.email })
      toast.success('Confirmation code generated! Please check console for the code.')
      setStep('reset')
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to generate confirmation code'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResetWithCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', {
        email: formData.email,
        confirmationCode: formData.confirmationCode,
        newPassword: formData.newPassword,
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResetWithCurrent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // First login to get token
      const loginResponse = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.currentPassword,
      })
      
      // Store token temporarily
      const token = loginResponse.data.accessToken
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update password
      await axios.put('/api/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      
      toast.success('Password updated successfully!')
      navigate('/login')
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update password'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    } finally {
      setLoading(false)
      delete axios.defaults.headers.common['Authorization']
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
      isDark 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-blue-50 via-indigo-50 to-purple-50'
    } py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Reset Password
          </h1>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Choose a method to reset your password
          </p>
        </div>

        {/* Card */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Method Selection */}
          {step === 'request' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setMethod('current')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    method === 'current'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      method === 'current'
                        ? 'bg-indigo-100 dark:bg-indigo-900/40'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Key className={`w-6 h-6 ${
                        method === 'current' 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        method === 'current'
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Current Password
                      </h3>
                      <p className={`text-xs ${
                        method === 'current'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Use your existing password
                      </p>
                    </div>
                    {method === 'current' && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('code')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    method === 'code'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      method === 'code'
                        ? 'bg-indigo-100 dark:bg-indigo-900/40'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Shield className={`w-6 h-6 ${
                        method === 'code' 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        method === 'code'
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Confirmation Code
                      </h3>
                      <p className={`text-xs ${
                        method === 'code'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Use a verification code
                      </p>
                    </div>
                    {method === 'code' && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* Request Code Form */}
              {method === 'code' && (
                <form onSubmit={handleRequestCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-code" className="text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <Input
                        id="email-code"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <Button type="submit" loading={loading} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    Generate Confirmation Code
                  </Button>
                </form>
              )}

              {/* Current Password Form */}
              {method === 'current' && (
                <form onSubmit={handleResetWithCurrent} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-current" className="text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <Input
                        id="email-current"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        required
                        className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        } transition-colors`}
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword-current" className="text-gray-700 dark:text-gray-300">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <Input
                        id="newPassword-current"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                        className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        } transition-colors`}
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword-current" className="text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <Input
                        id="confirmPassword-current"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        } transition-colors`}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" loading={loading} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    Reset Password
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Reset with Code Form */}
          {step === 'reset' && method === 'code' && (
            <form onSubmit={handleResetWithCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-reset" className="text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email-reset"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmationCode" className="text-gray-700 dark:text-gray-300">
                  Confirmation Code
                </Label>
                <div className="relative">
                  <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <Input
                    id="confirmationCode"
                    type="text"
                    value={formData.confirmationCode}
                    onChange={(e) => setFormData({ ...formData, confirmationCode: e.target.value })}
                    required
                    className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Enter confirmation code from console"
                  />
                </div>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Check console for the confirmation code
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword-code" className="text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <Input
                    id="newPassword-code"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword-code" className="text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <Input
                    id="confirmPassword-code"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                Reset Password
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
