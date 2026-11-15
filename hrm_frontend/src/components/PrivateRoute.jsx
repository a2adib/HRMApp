import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  const token = localStorage.getItem('access_token')

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#090A0F]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-400">Authenticating session...</span>
        </div>
      </div>
    )
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />
  }

  const currentRole = (role || user?.role || 'EMPLOYEE').toUpperCase()

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase())
    
    // HR Role aliases
    const isHrAllowed = normalizedAllowed.includes('HR') || normalizedAllowed.includes('HR_ADMIN') || normalizedAllowed.includes('SUPER_ADMIN')
    const userIsHr = currentRole === 'HR' || currentRole === 'HR_ADMIN' || currentRole === 'SUPER_ADMIN' || currentRole === 'COMPANY_ADMIN'

    const isManagerAllowed = normalizedAllowed.includes('MANAGER')
    const userIsManager = currentRole === 'MANAGER'

    const isEmployeeAllowed = normalizedAllowed.includes('EMPLOYEE')
    const userIsEmployee = currentRole === 'EMPLOYEE'

    const hasAccess = 
      normalizedAllowed.includes(currentRole) ||
      (isHrAllowed && userIsHr) ||
      (isManagerAllowed && userIsManager) ||
      (isEmployeeAllowed && (userIsEmployee || userIsManager || userIsHr))

    if (!hasAccess) {
      if (userIsHr) return <Navigate to="/hr/dashboard" replace />
      if (userIsManager) return <Navigate to="/manager/dashboard" replace />
      return <Navigate to="/employee/dashboard" replace />
    }
  }

  return children
}
