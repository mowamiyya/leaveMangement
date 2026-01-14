import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginAsync } from '../store/slices/authSlice'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const { loading, user } = useAppSelector((state) => state.auth)
  const { uiSettings } = useAppSelector((state) => state.settings)
  const isDark = uiSettings.theme === 'dark'
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (user.role === 'STUDENT') {
        navigate('/student/dashboard')
      } else {
        navigate('/teacher/dashboard')
      }
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(loginAsync({ email, password }))
    if (loginAsync.fulfilled.match(result)) {
      const userData = result.payload.user
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (userData.role === 'STUDENT') {
        navigate('/student/dashboard')
      } else {
        navigate('/teacher/dashboard')
      }
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
      isDark 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-blue-50 via-indigo-50 to-purple-50'
    } py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="w-full max-w-md">
        {/* Logo/Icon Section */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Welcome Back
          </h1>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sign in to your Leave Management account
          </p>
        </div>

        {/* Card */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {!loading && <ArrowRight className="w-5 h-5 mr-2" />}
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${
                isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
              }`}>
                New to the platform?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Create an account
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className={`mt-6 text-center text-xs ${
          isDark ? 'text-gray-500' : 'text-gray-600'
        }`}>
          © 2024 Leave Management System. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
