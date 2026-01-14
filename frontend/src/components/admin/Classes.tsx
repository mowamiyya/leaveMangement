import { useEffect, useState, useMemo, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Plus, Edit, Trash2, GraduationCap, Building2 } from 'lucide-react'
import SearchInput from '../ui/search-input'
import Pagination from '../ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { useAppSelector } from '../../store/hooks'

interface Department {
  departmentId: string
  departmentName: string
}

interface Class {
  classId: string
  className: string
  department: {
    departmentId: string
    departmentName: string
  }
}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ className: '', departmentId: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { uiSettings } = useAppSelector((state) => state.settings)
  const isDark = uiSettings.theme === 'dark'
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    try {
      const [classesRes, deptsRes] = await Promise.all([
        axios.get('/api/admin/classes'),
        axios.get('/api/admin/departments'),
      ])
      setClasses(classesRes.data)
      setDepartments(deptsRes.data)
    } catch (error: any) {
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await axios.put(`/api/admin/classes/${editing.classId}`, formData)
        toast.success('Class updated successfully')
      } else {
        await axios.post('/api/admin/classes', formData)
        toast.success('Class created successfully')
      }
      setShowModal(false)
      setEditing(null)
      setFormData({ className: '', departmentId: '' })
      fetchData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Operation failed'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    }
  }

  const handleEdit = (cls: Class) => {
    setEditing(cls)
    setFormData({ className: cls.className, departmentId: cls.department.departmentId })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return
    try {
      await axios.delete(`/api/admin/classes/${id}`)
      toast.success('Class deleted successfully')
      fetchData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Delete failed'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    }
  }

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes
    
    const query = searchQuery.toLowerCase()
    return classes.filter((cls) => 
      cls.className.toLowerCase().includes(query) ||
      cls.department.departmentName.toLowerCase().includes(query)
    )
  }, [classes, searchQuery])

  const paginatedClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredClasses.slice(startIndex, endIndex)
  }, [filteredClasses, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400 mb-2">
            Classes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage classes across departments</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormData({ className: '', departmentId: '' })
            setShowModal(true)
          }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by class name or department..."
          className="max-w-md"
        />
      </div>

      {filteredClasses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? 'No classes match your search' : 'No classes found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {paginatedClasses.map((cls, index) => (
              <div
                key={cls.classId}
                className={`group relative bg-gradient-to-br ${
                  isDark 
                    ? 'from-green-900/20 to-emerald-900/20 border-green-800/30' 
                    : 'from-green-50 to-emerald-50 border-green-200'
                } rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Animated background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-500/10 dark:bg-green-400/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.classId)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {cls.className}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>{cls.department.departmentName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Active</span>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            ))}
          </div>

          {filteredClasses.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredClasses.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogClose onClose={() => {
            setShowModal(false)
            setEditing(null)
            setFormData({ className: '', departmentId: '' })
          }} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {editing ? 'Edit' : 'Add'} Class
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter class name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  setEditing(null)
                  setFormData({ className: '', departmentId: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default Classes
