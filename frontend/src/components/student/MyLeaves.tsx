import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { Clock, CheckCircle, XCircle, Plus, FileText, MessageSquare } from 'lucide-react'
import { Button } from '../ui/button'
import SearchInput from '../ui/search-input'
import Pagination from '../ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog'
import DateRangePicker from '../ui/date-range-picker'

interface Leave {
  leaveId: string
  fromDate: string
  toDate: string
  subject: string
  reason: string
  status: string
  reportedToName: string
  appliedAt: string
  rejectionReason?: string
}

const MyLeaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    subject: '',
    reason: '',
  })

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/api/leaves/my-leaves')
      setLeaves(response.data)
    } catch (error: any) {
      toast.error('Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post('/api/leaves/apply', formData)
      toast.success('Leave applied successfully!')
      setFormData({ fromDate: '', toDate: '', subject: '', reason: '' })
      setShowApplyForm(false)
      fetchLeaves()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to apply leave'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotalDays = (fromDate: string, toDate: string): number => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates
    return diffDays
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', label: 'Pending' },
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200', label: 'Rejected' },
      DRAFT: { icon: Clock, color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200', label: 'Draft' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    )
  }

  const filteredLeaves = useMemo(() => {
    let filtered = leaves
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = leaves.filter((leave) => 
        leave.subject.toLowerCase().includes(query) ||
        leave.reason.toLowerCase().includes(query) ||
        leave.status.toLowerCase().includes(query) ||
        leave.reportedToName.toLowerCase().includes(query) ||
        format(new Date(leave.fromDate), 'MMM dd, yyyy').toLowerCase().includes(query) ||
        format(new Date(leave.toDate), 'MMM dd, yyyy').toLowerCase().includes(query)
      )
    }
    
    // Sort by status: PENDING first, then APPROVED, then REJECTED
    const statusOrder = { 'PENDING': 1, 'APPROVED': 2, 'REJECTED': 3 }
    return filtered.sort((a, b) => {
      const orderA = statusOrder[a.status as keyof typeof statusOrder] || 99
      const orderB = statusOrder[b.status as keyof typeof statusOrder] || 99
      return orderA - orderB
    })
  }, [leaves, searchQuery])

  const paginatedLeaves = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLeaves.slice(startIndex, endIndex)
  }, [filteredLeaves, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage)

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Leaves</h1>
        <Button onClick={() => setShowApplyForm(!showApplyForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by subject, reason, status, date, or reported to..."
          className="max-w-md"
        />
      </div>

      <Dialog open={showApplyForm} onOpenChange={setShowApplyForm}>
        <DialogContent className="max-w-3xl">
          <DialogClose onClose={() => {
            setShowApplyForm(false)
            setFormData({ fromDate: '', toDate: '', subject: '', reason: '' })
          }} />
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <DateRangePicker
              fromDate={formData.fromDate}
              toDate={formData.toDate}
              onFromDateChange={(date) => setFormData({ ...formData, fromDate: date })}
              onToDateChange={(date) => setFormData({ ...formData, toDate: date })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter leave subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Note <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter leave reason"
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" loading={submitting} className="flex-1">
                Submit Leave
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowApplyForm(false)
                  setFormData({ fromDate: '', toDate: '', subject: '', reason: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClose={() => setShowDetailModal(false)} />
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6">
              {/* Subject and Reason - Top Priority */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Subject</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedLeave.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Reason</p>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{selectedLeave.reason}</p>
                </div>
              </div>

              {/* Other Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {format(new Date(selectedLeave.fromDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {format(new Date(selectedLeave.toDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Days</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {calculateTotalDays(selectedLeave.fromDate, selectedLeave.toDate)} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <div>{getStatusBadge(selectedLeave.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reported To</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedLeave.reportedToName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Applied At</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLeave.appliedAt ? format(new Date(selectedLeave.appliedAt), 'MMM dd, yyyy HH:mm') : '-'}
                  </p>
                </div>
              </div>

              {selectedLeave.rejectionReason && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rejection Reason</p>
                  <p className="text-red-600 dark:text-red-400 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">{selectedLeave.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reported To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applied At</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No leaves match your search' : 'No leaves found'}
                </td>
              </tr>
            ) : (
              paginatedLeaves.map((leave) => {
                const totalDays = calculateTotalDays(leave.fromDate, leave.toDate)
                return (
                  <tr 
                    key={leave.leaveId} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedLeave(leave)
                      setShowDetailModal(true)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(leave.fromDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(leave.toDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {totalDays} {totalDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(leave.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.reportedToName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {leave.appliedAt ? format(new Date(leave.appliedAt), 'MMM dd, yyyy HH:mm') : '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredLeaves.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredLeaves.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  )
}

export default MyLeaves
