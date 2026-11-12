import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu, X, Bell, Search, Sun, Moon, BookOpen,
  ChevronDown, LogOut, User, Settings, Upload,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { supabase } from '../../lib/supabase'
import { clsx } from 'clsx'

interface HeaderProps {
  onMenuClick: () => void
  isMobileMenuOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobileMenuOpen }) => {
  const { user, profile, signOut } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) fetchUnreadCount()
  }, [user])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchUnreadCount = async () => {
    if (!user) return
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setUnreadCount(count ?? 0)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const avatarInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const roleColors = {
    admin: 'badge-red',
    faculty: 'badge-purple',
    student: 'badge-blue',
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white dark:bg-navy-900 border-b border-navy-200 dark:border-navy-800 flex items-center px-4 gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="btn btn-ghost btn-icon lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Logo (mobile) */}
      <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-navy-900 dark:text-white text-sm font-display">
          Find My Notes
        </span>
      </Link>

      {/* Desktop search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search notes, subjects, PYQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 pr-4 h-9 text-sm"
            />
          </div>
        </form>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Mobile search */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="btn btn-ghost btn-icon md:hidden"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost btn-icon relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 card animate-fade-in-up shadow-xl z-50">
              <div className="p-4 border-b border-navy-200 dark:border-navy-700 flex items-center justify-between">
                <h3 className="font-semibold text-navy-900 dark:text-white">Notifications</h3>
                <Link
                  to="/notifications"
                  className="text-xs text-brand-600 font-medium"
                  onClick={() => setShowNotifications(false)}
                >
                  View all
                </Link>
              </div>
              <div className="p-4 text-center text-navy-500 dark:text-navy-400 text-sm py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {avatarInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-navy-900 dark:text-white line-clamp-1 max-w-[100px]">
                {profile?.full_name ?? 'User'}
              </p>
              <p className="text-xs text-navy-400 capitalize">{profile?.role}</p>
            </div>
            <ChevronDown className={clsx('w-4 h-4 text-navy-400 transition-transform hidden sm:block', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 card animate-fade-in-up shadow-xl z-50 py-2">
              {/* User info */}
              <div className="px-4 py-3 border-b border-navy-100 dark:border-navy-700">
                <p className="font-semibold text-navy-900 dark:text-white text-sm">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-navy-500 dark:text-navy-400 truncate">{profile?.email}</p>
                <span className={clsx('badge mt-1.5', profile?.role ? roleColors[profile.role] : 'badge-gray')}>
                  {profile?.role}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  to="/my-uploads"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Upload className="w-4 h-4" />
                  My Uploads
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-navy-100 dark:border-navy-700 py-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-navy-900 border-b border-navy-200 dark:border-navy-800 p-4 md:hidden animate-fade-in-up">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search notes, subjects, PYQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 pr-4"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  )
}
