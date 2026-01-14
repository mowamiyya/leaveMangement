import { useEffect, useState, useMemo, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Trash2, Eye, UserCog, Mail, Building2, Clock, Activity } from 'lucide-react'
import { format } from 'date-fns'
import SearchInput from '../ui/search-input'
import Pagination from '../ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'

interface Teacher {
  teacherId: string
  name: string
  email: string
  department: {
    departmentId: string
    departmentName: string
  }
}

interface AuditLog {
  auditId: string
  entityType: string
  action: string
  oldValue: any
  newValue: any
  actionBy: string
  actionAt: string
  ipAddress?: string
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchTeachers()
    }
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/admin/teachers')
      setTeachers(response.data)
    } catch (error: any) {
      toast.error('Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async (teacherId: string) => {
    setLoadingAudit(true)
    try {
      const response = await axios.get('/api/admin/audit-logs', {
        params: {
          entityType: 'TEACHER',
          entityId: teacherId
        }
      })
      setAuditLogs(response.data)
    } catch (error: any) {
      toast.error('Failed to load audit logs')
      setAuditLogs([])
    } finally {
      setLoadingAudit(false)
    }
  }

  const handleViewDetails = async (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setShowDetailDialog(true)
    await fetchAuditLogs(teacher.teacherId)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this teacher?')) return
    try {
      await axios.delete(`/api/admin/teachers/${id}`)
      toast.success('Teacher deleted successfully')
      fetchTeachers()
      if (selectedTeacher?.teacherId === id) {
        setShowDetailDialog(false)
        setSelectedTeacher(null)
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Delete failed'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    }
  }

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers
    
    const query = searchQuery.toLowerCase()
    return teachers.filter((teacher) => 
      teacher.name.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query) ||
      teacher.department.departmentName.toLowerCase().includes(query)
    )
  }, [teachers, searchQuery])

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTeachers.slice(startIndex, endIndex)
  }, [filteredTeachers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'UPDATE': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
      case 'DELETE': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      case 'LOGIN': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400 mb-2">
          Teachers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage teachers and view their activity history</p>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, or department..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No teachers match your search' : 'No teachers found'}
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((teacher) => (
                <tr 
                  key={teacher.teacherId} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(teacher)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teacher.department.departmentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(teacher)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(teacher.teacherId, e)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {filteredTeachers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredTeachers.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Detail Dialog with Audit Logs */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogClose onClose={() => {
            setShowDetailDialog(false)
            setSelectedTeacher(null)
            setAuditLogs([])
          }} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <UserCog className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Teacher Details
            </DialogTitle>
            <DialogDescription>
              Complete information and activity history
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-6 py-4">
              {/* Teacher Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <UserCog className="w-4 h-4" />
                      {selectedTeacher.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedTeacher.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedTeacher.department.departmentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teacher ID</p>
                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{selectedTeacher.teacherId}</p>
                  </div>
                </div>
              </div>

              {/* Audit Logs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Activity History
                </h3>
                {loadingAudit ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading audit logs...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No activity history found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div
                        key={log.auditId}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-indigo-500"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(log.actionAt), 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">IP: {log.ipAddress}</p>
                        )}
                        {log.oldValue && Object.keys(log.oldValue).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Old Values:</p>
                            <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newValue && Object.keys(log.newValue).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Values:</p>
                            <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailDialog(false)
                setSelectedTeacher(null)
                setAuditLogs([])
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Teachers
