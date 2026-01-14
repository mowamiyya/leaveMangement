import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "relative z-50 w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6",
      className
    )}>
      {children}
    </div>
  )
}

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <h2 className={cn("text-2xl font-semibold text-gray-900 dark:text-gray-100", className)}>
      {children}
    </h2>
  )
}

const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-gray-600 dark:text-gray-400", className)}>
      {children}
    </p>
  )
}

const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", className)}>
      {children}
    </div>
  )
}

const DialogClose: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <X className="w-5 h-5" />
    </button>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose }
