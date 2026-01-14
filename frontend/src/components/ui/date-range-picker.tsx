import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  fromDate: string
  toDate: string
  onFromDateChange: (date: string) => void
  onToDateChange: (date: string) => void
  disabled?: boolean
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  disabled = false,
}) => {
  const [isFromOpen, setIsFromOpen] = useState(false)
  const [isToOpen, setIsToOpen] = useState(false)
  const [fromCurrentMonth, setFromCurrentMonth] = useState(new Date())
  const [toCurrentMonth, setToCurrentMonth] = useState(new Date())
  const fromPickerRef = useRef<HTMLDivElement>(null)
  const toPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromPickerRef.current && !fromPickerRef.current.contains(event.target as Node)) {
        setIsFromOpen(false)
      }
      if (toPickerRef.current && !toPickerRef.current.contains(event.target as Node)) {
        setIsToOpen(false)
      }
    }

    if (isFromOpen || isToOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFromOpen, isToOpen])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const calculateDays = (): number => {
    if (!fromDate || !toDate) return 0
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const isDateDisabled = (date: Date, isFrom: boolean): boolean => {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    
    if (isFrom) {
      // For from date, disable previous days
      if (dateOnly < today) return true
    } else {
      // For to date, disable previous days and dates before fromDate
      if (dateOnly < today) return true
      if (fromDate) {
        const from = new Date(fromDate)
        from.setHours(0, 0, 0, 0)
        if (dateOnly < from) return true
      }
    }
    
    return false
  }

  const handleDateSelect = (date: Date, isFrom: boolean) => {
    if (isFrom) {
      const dateStr = format(date, 'yyyy-MM-dd')
      onFromDateChange(dateStr)
      setIsFromOpen(false)
      if (toDate && dateStr > toDate) {
        onToDateChange('')
      }
    } else {
      const dateStr = format(date, 'yyyy-MM-dd')
      onToDateChange(dateStr)
      setIsToOpen(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next', isFrom: boolean) => {
    if (isFrom) {
      setFromCurrentMonth((prev) => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      })
    } else {
      setToCurrentMonth((prev) => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      })
    }
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const renderCalendar = (isFrom: boolean, pickerRef: React.RefObject<HTMLDivElement>, isOpen: boolean, setIsOpen: (open: boolean) => void) => {
    const selectedDate = isFrom ? fromDate : toDate
    const selectedDateObj = selectedDate ? new Date(selectedDate) : null
    const currentMonth = isFrom ? fromCurrentMonth : toCurrentMonth
    const days = getDaysInMonth(currentMonth)

    return (
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || (isFrom ? false : !fromDate)}
          className={cn(
            "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            "flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            (disabled || (!isFrom && !fromDate)) && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn(
            selectedDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
            'text-sm'
          )}>
            {selectedDate ? format(selectedDateObj!, 'MMM dd, yyyy') : 'Pick a date'}
          </span>
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev', isFrom)}
                className="flex-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <span className="text-xl">‹</span>
              </button>
              <div className="flex gap-2 flex-1 justify-center">
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => {
                    if (isFrom) {
                      setFromCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))
                    } else {
                      setToCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundImage: 'none',
                    paddingRight: '8px'
                  }}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month.substring(0, 3)}</option>
                  ))}
                </select>
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => {
                    if (isFrom) {
                      setFromCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))
                    } else {
                      setToCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundImage: 'none',
                    paddingRight: '8px'
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => currentMonth.getFullYear() - 5 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => navigateMonth('next', isFrom)}
                className="flex-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <span className="text-xl">›</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-8" />
                }

                const isSelected = selectedDate && format(selectedDateObj!, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                const isDisabled = isDateDisabled(date, isFrom)

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date, isFrom)}
                    disabled={isDisabled}
                    className={cn(
                      "h-8 w-8 rounded text-sm",
                      isSelected && "bg-indigo-600 dark:bg-indigo-500 text-white",
                      !isSelected && !isDisabled && "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
                      isDisabled && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                      isToday && !isSelected && "font-bold border border-indigo-300 dark:border-indigo-500"
                    )}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const totalDays = calculateDays()

  return (
    <div className="grid grid-cols-3 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          From Date <span className="text-red-500">*</span>
        </label>
        {renderCalendar(true, fromPickerRef, isFromOpen, setIsFromOpen)}
      </div>
      
      <div className="text-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          Days
        </label>
        <div className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-md py-1 text-center">
          <div className="text-3xl font-bold">{totalDays}</div>
          <div className="text-sm">days</div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          To Date <span className="text-red-500">*</span>
        </label>
        {renderCalendar(false, toPickerRef, isToOpen, setIsToOpen)}
      </div>
    </div>
  )
}

export default DateRangePicker
