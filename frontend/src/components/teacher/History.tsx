import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format, differenceInDays } from 'date-fns'
import { CheckCircle, XCircle, History as HistoryIcon } from 'lucide-react'
import SearchInput from '../ui/search-input'
import Pagination from '../ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'

interface LeaveHistory {
  leaveId: string
  applicantName: string
  className: string
  fromDate: string
  toDate: string
  subject: string
  reason: string
  status: string
  appliedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  action: 'APPROVED' | 'REJECTED'
}

const History = () => {
  const [history, setHistory] = useState<LeaveHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<LeaveHistory | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/leaves/all')
      const leaves = response.data
      
      // Transform leaves to show action history - only approved and rejected
      const historyData: LeaveHistory[] = leaves
        .filter((leave: any) => leave.status === 'APPROVED' || leave.status === 'REJECTED')
        .map((leave: any) => {
          let action: 'APPROVED' | 'REJECTED' = leave.status === 'APPROVED' ? 'APPROVED' : 'REJECTED'
          
          return {
            ...leave,
            action,
          }
        })
      
      setHistory(historyData)
    } catch (error: any) {
      toast.error('Failed to load history')
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

  const getActionBadge = (action: string) => {
    const config = {
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200', label: 'Rejected' },
    }
    const actionConfig = config[action as keyof typeof config] || config.APPROVED
    const Icon = actionConfig.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${actionConfig.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {actionConfig.label}
      </span>
    )
  }

  const filteredHistory = useMemo(() => {
    let filtered = filter === 'ALL' 
      ? history 
      : history.filter(item => item.action === filter)
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => 
        item.applicantName.toLowerCase().includes(query) ||
        item.className.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query) ||
        (item.rejectionReason && item.rejectionReason.toLowerCase().includes(query)) ||
        format(new Date(item.fromDate), 'MMM dd, yyyy').toLowerCase().includes(query) ||
        format(new Date(item.toDate), 'MMM dd, yyyy').toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [history, filter, searchQuery])

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredHistory.slice(startIndex, endIndex)
  }, [filteredHistory, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filter])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Action History</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'ALL' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'APPROVED' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'REJECTED' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by student name, class, subject, reason, or date..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rejection Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No history matches your search' : 'No history found'}
                </td>
              </tr>
            ) : (
              paginatedHistory.map((item) => (
                <tr 
                  key={item.leaveId} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedItem(item)
                    setShowDetailDialog(true)
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.applicantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.className}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {format(new Date(item.fromDate), 'MMM dd, yyyy')} - {format(new Date(item.toDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculateTotalDays(item.fromDate, item.toDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(item.action)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.approvedAt 
                      ? format(new Date(item.approvedAt), 'MMM dd, yyyy HH:mm')
                      : item.rejectedAt 
                      ? format(new Date(item.rejectedAt), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {item.rejectionReason || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredHistory.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredHistory.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Leave Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogClose onClose={() => {
            setShowDetailDialog(false)
            setSelectedItem(null)
          }} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Leave Details</DialogTitle>
            <DialogDescription>
              Complete information about the leave application
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6 py-4">
              {/* Subject and Reason - Top Priority */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Subject</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedItem.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Reason</p>
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{selectedItem.reason}</p>
                </div>
              </div>

              {/* Other Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{selectedItem.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{selectedItem.className}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {format(new Date(selectedItem.fromDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {format(new Date(selectedItem.toDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {calculateTotalDays(selectedItem.fromDate, selectedItem.toDate)} day(s)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  {getActionBadge(selectedItem.action)}
                </div>
                {selectedItem.appliedAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applied At</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {format(new Date(selectedItem.appliedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {(selectedItem.approvedAt || selectedItem.rejectedAt) && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Action Date</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {selectedItem.approvedAt 
                        ? format(new Date(selectedItem.approvedAt), 'MMM dd, yyyy HH:mm')
                        : selectedItem.rejectedAt 
                        ? format(new Date(selectedItem.rejectedAt), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </p>
                  </div>
                )}
              </div>

              {selectedItem.rejectionReason && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rejection Reason</p>
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    {selectedItem.rejectionReason}
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
                setSelectedItem(null)
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

export default History
