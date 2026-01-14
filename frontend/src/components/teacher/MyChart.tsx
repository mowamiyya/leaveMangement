import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Network, ChevronRight, Building2, GraduationCap, User } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import { cn } from '@/lib/utils'

interface HierarchyNode {
  id: string
  name: string
  type: string
  children: HierarchyNode[]
}

const MyChart = () => {
  const [tree, setTree] = useState<HierarchyNode | null>(null)
  const [loading, setLoading] = useState(true)
  const { uiSettings } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)
  const isDark = uiSettings.theme === 'dark'

  useEffect(() => {
    fetchHierarchy()
  }, [])

  const fetchHierarchy = async () => {
    try {
      const response = await axios.get('/api/hierarchy/tree')
      setTree(response.data)
    } catch (error: any) {
      toast.error('Failed to load hierarchy')
    } finally {
      setLoading(false)
    }
  }

  const getNodeStyle = (type: string, isCurrentTeacher: boolean = false) => {
    const styles = {
      DEPARTMENT: {
        bg: isDark ? 'bg-blue-900/30 border-blue-500/50' : 'bg-blue-50 border-blue-200',
        text: isDark ? 'text-blue-300' : 'text-blue-700',
        icon: isDark ? 'text-blue-400' : 'text-blue-600',
        iconComponent: Building2,
      },
      CLASS: {
        bg: isDark ? 'bg-green-900/30 border-green-500/50' : 'bg-green-50 border-green-200',
        text: isDark ? 'text-green-300' : 'text-green-700',
        icon: isDark ? 'text-green-400' : 'text-green-600',
        iconComponent: GraduationCap,
      },
      TEACHER: {
        bg: isCurrentTeacher 
          ? (isDark ? 'bg-indigo-900/50 border-indigo-400 ring-2 ring-indigo-400' : 'bg-indigo-100 border-indigo-400 ring-2 ring-indigo-400')
          : (isDark ? 'bg-purple-900/30 border-purple-500/50' : 'bg-purple-50 border-purple-200'),
        text: isCurrentTeacher
          ? (isDark ? 'text-indigo-200 font-bold' : 'text-indigo-800 font-bold')
          : (isDark ? 'text-purple-300' : 'text-purple-700'),
        icon: isCurrentTeacher
          ? (isDark ? 'text-indigo-300' : 'text-indigo-600')
          : (isDark ? 'text-purple-400' : 'text-purple-600'),
        iconComponent: User,
      },
    }
    return styles[type as keyof typeof styles] || {
      bg: isDark ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200',
      text: isDark ? 'text-gray-200' : 'text-gray-700',
      icon: isDark ? 'text-gray-400' : 'text-gray-500',
      iconComponent: User,
    }
  }

  const renderNode = (node: HierarchyNode, level: number = 0): React.ReactNode => {
    // Skip STUDENT nodes - only show DEPARTMENT, CLASS, and TEACHER
    if (node.type === 'STUDENT') {
      return null
    }

    const indent = level * 20
    const isCurrentTeacher = node.type === 'TEACHER' && user?.userId === node.id
    const style = getNodeStyle(node.type, isCurrentTeacher)
    const IconComponent = style.iconComponent

    // Filter children to exclude STUDENT nodes
    const visibleChildren = node.children.filter(child => child.type !== 'STUDENT')

    return (
      <div key={node.id} className="mb-2">
        <div 
          className={cn(
            "flex items-center px-4 py-3 rounded-lg border transition-all hover:shadow-lg",
            style.bg,
            isCurrentTeacher && "shadow-lg scale-[1.02]"
          )}
          style={{ marginLeft: `${indent}px` }}
        >
          <IconComponent className={cn("w-5 h-5 mr-3 flex-shrink-0", style.icon)} />
          {visibleChildren.length > 0 && (
            <ChevronRight className={cn(
              "w-4 h-4 mr-2 flex-shrink-0",
              style.icon
            )} />
          )}
          <span className={cn("font-medium flex-1", style.text)}>{node.name}</span>
          {isCurrentTeacher && (
            <span className={cn(
              "ml-2 text-xs px-2 py-1 rounded-full font-semibold",
              isDark ? "bg-indigo-800 text-indigo-200" : "bg-indigo-600 text-white"
            )}>
              You
            </span>
          )}
          <span className={cn(
            "ml-auto text-xs px-2 py-1 rounded-full",
            isDark ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"
          )}>
            {node.type}
          </span>
        </div>
        {/* Recursively render visible children */}
        {visibleChildren.map((child) => renderNode(child, level + 1))}
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Hierarchy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Department → Class → Teacher Structure</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Organization Hierarchy</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View your position in the organizational structure</p>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto overflow-x-hidden">
          {tree && tree.children.length > 0 ? (
            tree.children.map((child) => renderNode(child, 0))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hierarchy data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyChart
