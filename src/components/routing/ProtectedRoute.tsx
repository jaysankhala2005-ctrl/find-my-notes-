import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LoadingScreen } from '../ui/LoadingScreen'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('student' | 'faculty' | 'admin')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    if (profile.role === 'admin') return <Navigate to="/admin" replace />
    if (profile.role === 'faculty') return <Navigate to="/faculty" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export const PublicRoute: React.FC = () => {
  const { user, profile, loading } = useAuthStore()

  if (loading) {
    return <LoadingScreen />
  }

  if (user && profile) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />
    if (profile.role === 'faculty') return <Navigate to="/faculty" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
