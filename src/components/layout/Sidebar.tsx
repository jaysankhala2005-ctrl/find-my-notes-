import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Bookmark, Clock, TrendingUp,
  Upload, Search, ChevronRight, GraduationCap,
  Shield, Users, FileText, Settings, Bell,
  PenLine, HelpCircle, X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const studentNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BookOpen, label: 'Browse Notes', to: '/courses' },
  { icon: Search, label: 'Search', to: '/search' },
  { icon: Bookmark, label: 'Bookmarks', to: '/bookmarks' },
  { icon: Clock, label: 'Recently Viewed', to: '/recent' },
  { icon: TrendingUp, label: 'Study Progress', to: '/progress' },
  { icon: Upload, label: 'Upload Materials', to: '/upload' },
  { icon: Bell, label: 'Notifications', to: '/notifications' },
]

const facultyNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/faculty' },
  { icon: Upload, label: 'Upload Notes', to: '/faculty/upload' },
  { icon: FileText, label: 'My Materials', to: '/faculty/materials' },
  { icon: HelpCircle, label: 'My Questions', to: '/faculty/questions' },
  { icon: Bell, label: 'Notifications', to: '/notifications' },
]

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
  { icon: Users, label: 'Manage Users', to: '/admin/users' },
  { icon: GraduationCap, label: 'Manage Courses', to: '/admin/courses' },
  { icon: BookOpen, label: 'Manage Subjects', to: '/admin/subjects' },
  { icon: FileText, label: 'Manage Notes', to: '/admin/notes' },
  { icon: PenLine, label: 'Manage Questions', to: '/admin/questions' },
  { icon: Upload, label: 'Pending Approvals', to: '/admin/approvals' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  const role = profile?.role ?? 'student'
  const navItems = role === 'admin' ? adminNav : role === 'faculty' ? facultyNav : studentNav

  const roleLabel = { admin: 'Admin Panel', faculty: 'Faculty Portal', student: 'Student Portal' }
  const roleColors = {
    admin: 'text-red-400',
    faculty: 'text-purple-400',
    student: 'text-brand-400',
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'sidebar transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-navy-800">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { navigate('/dashboard'); onClose() }}
          >
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center animate-pulse-glow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm font-display leading-none">Find My Notes</h1>
              <p className="text-navy-400 text-xs mt-0.5">Study Smart · Score Higher</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon lg:hidden text-navy-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-800/60 border border-navy-700">
            {role === 'admin' && <Shield className="w-3.5 h-3.5 text-red-400" />}
            {role === 'faculty' && <GraduationCap className="w-3.5 h-3.5 text-purple-400" />}
            {role === 'student' && <BookOpen className="w-3.5 h-3.5 text-brand-400" />}
            <span className={clsx('text-xs font-semibold', roleColors[role])}>
              {roleLabel[role]}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-3 mb-2">
            <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider px-3 mb-1">
              Navigation
            </p>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/admin' || item.to === '/faculty'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose()
              }}
              className={({ isActive }) =>
                clsx('sidebar-nav-item', isActive && 'active')
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="p-4 border-t border-navy-800">
          <NavLink
            to="/profile"
            onClick={() => { if (window.innerWidth < 1024) onClose() }}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 p-2 rounded-xl transition-all',
                isActive
                  ? 'bg-navy-800'
                  : 'hover:bg-navy-800/60'
              )
            }
          >
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile?.full_name}</p>
              <p className="text-xs text-navy-400 truncate">{profile?.email}</p>
            </div>
            <Settings className="w-4 h-4 text-navy-500 flex-shrink-0" />
          </NavLink>
        </div>
      </aside>
    </>
  )
}
