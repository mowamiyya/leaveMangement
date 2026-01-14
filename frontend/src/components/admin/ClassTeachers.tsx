import { useEffect, useState, useMemo, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Plus, BookOpen, Edit, Trash2 } from 'lucide-react'
import SearchInput from '../ui/search-input'
import Pagination from '../ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'

interface Class {
  classId: string
  className: string
  department: {
    departmentName: string
  }
}

interface Teacher {
  teacherId: string
  name: string
  email: string
}

interface ClassTeacher {
  classTeacherId: string
  classEntity: Class
  teacher: Teacher
}

const ClassTeachers = () => {
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ClassTeacher | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ classId: '', teacherId: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    try {
      const [ctRes, classesRes, teachersRes] = await Promise.all([
        axios.get('/api/admin/class-teachers'),
        axios.get('/api/admin/classes'),
        axios.get('/api/admin/teachers'),
      ])
      setClassTeachers(ctRes.data)
      setClasses(classesRes.data)
      setTeachers(teachersRes.data)
    } catch (error: any) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await axios.put(`/api/admin/class-teachers/${editing.classTeacherId}`, {
          classId: formData.classId,
          teacherId: formData.teacherId,
        })
        toast.success('Class teacher updated successfully')
      } else {
        await axios.post('/api/admin/class-teachers', {
          classId: formData.classId,
          teacherId: formData.teacherId,
        })
        toast.success('Class teacher assigned successfully')
      }
      setShowModal(false)
      setEditing(null)
      setFormData({ classId: '', teacherId: '' })
      fetchData()
    } catch (error: any) {
      let errorMsg = editing ? 'Failed to update class teacher' : 'Failed to assign class teacher'
      if (error.response?.data?.message) {
        const msg = error.response.data.message
        // Extract key information from error message
        if (msg.includes('already assigned') || msg.includes('already exists')) {
          errorMsg = 'This class already has a teacher assigned'
        } else if (msg.includes('not found')) {
          errorMsg = 'Class or teacher not found'
        } else if (msg.length > 80) {
          // Truncate long messages
          errorMsg = msg.substring(0, 80) + '...'
        } else {
          errorMsg = msg
        }
      }
      toast.error(errorMsg)
    }
  }

  const handleEdit = (ct: ClassTeacher) => {
    setEditing(ct)
    setFormData({
      classId: ct.classEntity.classId,
      teacherId: ct.teacher.teacherId,
    })
    setShowModal(true)
  }

  const handleDelete = async (classTeacherId: string) => {
    if (!window.confirm('Are you sure you want to delete this class teacher assignment?')) {
      return
    }
    try {
      await axios.delete(`/api/admin/class-teachers/${classTeacherId}`)
      toast.success('Class teacher assignment deleted successfully')
      fetchData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete class teacher assignment'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    }
  }

  const filteredClassTeachers = useMemo(() => {
    if (!searchQuery.trim()) return classTeachers
    
    const query = searchQuery.toLowerCase()
    return classTeachers.filter((ct) => 
      ct.classEntity.className.toLowerCase().includes(query) ||
      ct.classEntity.department.departmentName.toLowerCase().includes(query) ||
      ct.teacher.name.toLowerCase().includes(query) ||
      ct.teacher.email.toLowerCase().includes(query)
    )
  }, [classTeachers, searchQuery])

  const paginatedClassTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredClassTeachers.slice(startIndex, endIndex)
  }, [filteredClassTeachers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredClassTeachers.length / itemsPerPage)

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400 mb-2">
            Class Teachers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Assign teachers to classes</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Assign Class Teacher
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by class, department, teacher name, or email..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredClassTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No class teachers match your search' : 'No class teachers assigned'}
                </td>
              </tr>
            ) : (
              paginatedClassTeachers.map((ct) => (
                <tr key={ct.classTeacherId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{ct.classEntity.className}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{ct.classEntity.department.departmentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{ct.teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{ct.teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(ct)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ct.classTeacherId)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredClassTeachers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredClassTeachers.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogClose onClose={() => {
            setShowModal(false)
            setFormData({ classId: '', teacherId: '' })
          }} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              {editing ? 'Edit Class Teacher' : 'Assign Class Teacher'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {editing ? 'Update the class teacher assignment' : 'Select a class and assign a teacher to manage it'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.className} - {cls.department.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.name} ({teacher.email})
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
                  setFormData({ classId: '', teacherId: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {editing ? 'Update' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClassTeachers
