import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format, differenceInDays } from 'date-fns'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import SearchInput from '../ui/search-input'
import Pagination from '../ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog'

interface Leave {
  leaveId: string
  applicantName: string
  className: string
  fromDate: string
  toDate: string
  subject: string
  reason: string
  status: string
  appliedAt?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

const Approvals = () => {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/api/leaves/all')
      setLeaves(response.data)
    } catch (error: any) {
      toast.error('Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalDays = (fromDate: string, toDate: string): number => {
    if (!fromDate || !toDate) return 0
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const diff = differenceInDays(to, from)
    return diff >= 0 ? diff + 1 : 0
  }

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', label: 'Pending' },
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200', label: 'Rejected' },
    }
    const statusConfig = config[status as keyof typeof config] || config.PENDING
    const Icon = statusConfig.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {statusConfig.label}
      </span>
    )
  }

  const handleApprove = async (leaveId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setProcessing(true)
    try {
      await axios.post('/api/leaves/approve', {
        leaveId,
        action: 'APPROVE',
        rejectionReason: '',
      })
      toast.success('Leave approved successfully')
      fetchLeaves()
      if (selectedLeave?.leaveId === leaveId) {
        setShowDetailDialog(false)
        setSelectedLeave(null)
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to approve leave'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectClick = (leaveId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRejectingLeaveId(leaveId)
    setRejectionReason('')
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectingLeaveId) return
    
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    setProcessing(true)
    try {
      await axios.post('/api/leaves/approve', {
        leaveId: rejectingLeaveId,
        action: 'REJECT',
        rejectionReason: rejectionReason.trim(),
      })
      toast.success('Leave rejected successfully')
      fetchLeaves()
      setShowRejectDialog(false)
      setRejectingLeaveId(null)
      setRejectionReason('')
      if (selectedLeave?.leaveId === rejectingLeaveId) {
        setShowDetailDialog(false)
        setSelectedLeave(null)
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to reject leave'
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  const filteredLeaves = useMemo(() => {
    let filtered = leaves
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = leaves.filter((leave) => 
        leave.applicantName.toLowerCase().includes(query) ||
        leave.className.toLowerCase().includes(query) ||
        leave.subject.toLowerCase().includes(query) ||
        leave.reason.toLowerCase().includes(query) ||
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Leave Approvals</h1>
      {leaves.length > 0 && (
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by student name, class, subject, reason, or date..."
            className="max-w-md"
          />
        </div>
      )}
      {filteredLeaves.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No leaves match your search' : 'No leaves found'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applied At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLeaves.map((leave) => {
                const totalDays = calculateTotalDays(leave.fromDate, leave.toDate)
                return (
                  <tr 
                    key={leave.leaveId} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedLeave(leave)
                      setShowDetailDialog(true)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {leave.applicantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {leave.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(leave.fromDate), 'MMM dd, yyyy')} - {format(new Date(leave.toDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {totalDays} {totalDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {leave.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {leave.appliedAt ? format(new Date(leave.appliedAt), 'MMM dd, yyyy HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      {leave.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => handleApprove(leave.leaveId, e)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => handleRejectClick(leave.leaveId, e)}
                            disabled={processing}
                            className="px-3 py-1"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

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

      {/* Leave Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogClose onClose={() => {
            setShowDetailDialog(false)
            setSelectedLeave(null)
          }} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Leave Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6 py-4">
              {/* Subject and Reason - Top Priority */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Subject</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedLeave.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Reason</p>
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{selectedLeave.reason}</p>
                </div>
              </div>

              {/* Other Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{selectedLeave.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{selectedLeave.className}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {format(new Date(selectedLeave.fromDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {format(new Date(selectedLeave.toDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {calculateTotalDays(selectedLeave.fromDate, selectedLeave.toDate)} day(s)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  {getStatusBadge(selectedLeave.status)}
                </div>
                {selectedLeave.appliedAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applied At</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {format(new Date(selectedLeave.appliedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {selectedLeave.approvedAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Approved At</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {format(new Date(selectedLeave.approvedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {selectedLeave.rejectedAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rejected At</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {format(new Date(selectedLeave.rejectedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>

              {selectedLeave.rejectionReason && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rejection Reason</p>
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    {selectedLeave.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailDialog(false)
                setSelectedLeave(null)
              }}
            >
              Close
            </Button>
            {selectedLeave && selectedLeave.status === 'PENDING' && (
              <>
                <Button
                  onClick={() => handleApprove(selectedLeave.leaveId)}
                  disabled={processing}
                  loading={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailDialog(false)
                    setRejectingLeaveId(selectedLeave.leaveId)
                    setRejectionReason('')
                    setShowRejectDialog(true)
                  }}
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogClose onClose={() => {
            setShowRejectDialog(false)
            setRejectingLeaveId(null)
            setRejectionReason('')
          }} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reject Leave</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter rejection reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectingLeaveId(null)
                setRejectionReason('')
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processing || !rejectionReason.trim()}
              loading={processing}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Approvals
