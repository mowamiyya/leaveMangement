import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { UserPlus, User, GraduationCap, Eye, EyeOff, Mail, Lock, UserCircle, Building2, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerAsync } from '../store/slices/authSlice'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import Loader from '../components/Loader'

interface Department {
  departmentId: string
  departmentName: string
}

interface Class {
  classId: string
  className: string
  departmentId: string
  departmentName: string
}

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    classId: '',
    departmentId: '',
    teacherDepartmentId: '',
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.auth)
  const { uiSettings } = useAppSelector((state) => state.settings)
  const isDark = uiSettings.theme === 'dark'

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (formData.departmentId && formData.role === 'STUDENT') {
      fetchClasses(formData.departmentId)
    } else {
      setClasses([])
    }
  }, [formData.departmentId, formData.role])

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/public/departments')
      setDepartments(response.data)
    } catch (error: any) {
      toast.error('Failed to load departments')
    } finally {
      setLoadingData(false)
    }
  }

  const fetchClasses = async (departmentId: string) => {
    try {
      const response = await axios.get(`/api/public/classes?departmentId=${departmentId}`)
      setClasses(response.data)
    } catch (error: any) {
      toast.error('Failed to load classes')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.role === 'STUDENT' && !formData.classId) {
      toast.error('Please select a class')
      return
    }

    if (formData.role === 'TEACHER' && !formData.teacherDepartmentId) {
      toast.error('Please select a department')
      return
    }

    const registrationData: any = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    }

    if (formData.role === 'STUDENT') {
      registrationData.classId = formData.classId
      registrationData.departmentId = formData.departmentId
    } else {
      registrationData.teacherDepartmentId = formData.teacherDepartmentId
    }

    const result = await dispatch(registerAsync(registrationData))
    if (registerAsync.fulfilled.match(result)) {
      navigate('/login')
    }
  }

  if (loadingData) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
        isDark 
          ? 'from-gray-900 via-gray-800 to-gray-900' 
          : 'from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <Loader text="Loading registration form..." />
      </div>
    )
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
            Create Account
          </h1>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join the Leave Management System
          </p>
        </div>

        {/* Card */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                Full Name
              </Label>
              <div className="relative">
                <UserCircle className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Create password"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="pl-10 pr-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Register as</Label>
              <RadioGroup className="grid grid-cols-2 gap-4">
                <RadioGroupItem
                  id="role-student"
                  name="role"
                  value="STUDENT"
                  checked={formData.role === 'STUDENT'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, classId: '', departmentId: '', teacherDepartmentId: '' })}
                  label="Student"
                  icon={<GraduationCap className="w-5 h-5" />}
                />
                <RadioGroupItem
                  id="role-teacher"
                  name="role"
                  value="TEACHER"
                  checked={formData.role === 'TEACHER'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, classId: '', departmentId: '', teacherDepartmentId: '' })}
                  label="Teacher"
                  icon={<User className="w-5 h-5" />}
                />
              </RadioGroup>
            </div>

            {/* Student Fields */}
            {formData.role === 'STUDENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Department
                  </Label>
                  <Select
                    id="department"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, classId: '' })}
                    required
                    className="h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Class
                  </Label>
                  <Select
                    id="class"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                    disabled={!formData.departmentId}
                    className="h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* Teacher Fields */}
            {formData.role === 'TEACHER' && (
              <div className="space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Label htmlFor="teacherDepartment" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Department
                </Label>
                <Select
                  id="teacherDepartment"
                  value={formData.teacherDepartmentId}
                  onChange={(e) => setFormData({ ...formData, teacherDepartmentId: e.target.value })}
                  required
                  className="h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {!loading && <UserPlus className="w-5 h-5 mr-2" />}
              Create Account
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
