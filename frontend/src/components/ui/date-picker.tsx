import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  minDate?: string
  maxDate?: string
  disabled?: boolean
  placeholder?: string
  className?: string
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Select date',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateDisabled = (date: Date): boolean => {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    
    // Disable previous days
    if (dateOnly < today) {
      return true
    }
    
    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      if (dateOnly < min) {
        return true
      }
    }
    
    if (maxDate) {
      const max = new Date(maxDate)
      max.setHours(0, 0, 0, 0)
      if (dateOnly > max) {
        return true
      }
    }
    
    return false
  }

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    
    setSelectedDate(date)
    const dateStr = format(date, 'yyyy-MM-dd')
    onChange(dateStr)
    setIsOpen(false)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          "flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span className={selectedDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <span className="text-gray-600">‹</span>
            </button>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <span className="text-gray-600">›</span>
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

              const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
              const isDisabled = isDateDisabled(date)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
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

export default DatePicker
