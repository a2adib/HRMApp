import React, { useState, useMemo, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Layers,
  Building2,
  FileBarChart,
  Settings,
  HelpCircle,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  UserPlus,
  Download,
  CheckCircle2,
} from 'lucide-react'
import { Avatar } from './ui/avatar'
import { cn } from '../lib/utils'

export default function Layout({ children }) {
  const { role, username, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Role-based navigation definition
  const navSections = useMemo(() => {
    if (role === 'hr') {
      return [
        {
          title: 'Workforce Operations',
          items: [
            { label: 'Overview', path: '/hr/dashboard', icon: LayoutDashboard, badge: null },
            { label: 'Employees', path: '/hr/users', icon: Users, badge: '1,248' },
            { label: 'Attendance', path: '/hr/attendance', icon: Clock, badge: '38 Late', badgeVariant: 'warning' },
            { label: 'Leave Requests', path: '/hr/leave-approval', icon: Calendar, badge: '6 New', badgeVariant: 'brand' },
          ]
        },
        {
          title: 'Organization',
          items: [
            { label: 'Onboard User', path: '/hr/add-user', icon: UserPlus },
            { label: 'Timesheet Export', path: '/hr/export', icon: Download },
          ]
        }
      ]
    }

    if (role === 'manager') {
      return [
        {
          title: 'Management',
          items: [
            { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
            { label: 'Assigned Team', path: '/manager/employees', icon: Users },
            { label: 'Team Attendance', path: '/manager/attendance', icon: Clock },
            { label: 'Leave Approvals', path: '/manager/leave-approval', icon: Calendar, badge: '2 Pending' },
            { label: 'Apply Leave', path: '/manager/leave-request', icon: Calendar },
          ]
        }
      ]
    }

    return [
      {
        title: 'Employee Portal',
        items: [
          { label: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { label: 'My Attendance', path: '/employee/attendance', icon: Clock },
          { label: 'Leave Requests', path: '/employee/leave-request', icon: Calendar },
        ]
      }
    ]
  }, [role])

  // Simple breadcrumb generator
  const currentTitle = useMemo(() => {
    for (const section of navSections) {
      const match = section.items.find(i => i.path === location.pathname)
      if (match) return match.label
    }
    return 'Dashboard'
  }, [navSections, location.pathname])

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D15] text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#0E131F] border-r border-slate-200 dark:border-slate-800/90 flex flex-col justify-between transition-all duration-300 select-none shadow-sm',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div>
          {/* Logo & Company Switcher */}
          <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm shadow-brand-500/20">
                HP
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h1 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    HR Pulse Enterprise
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono truncate">Acme Global HQ</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="p-2 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all relative',
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200')} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span className={cn(
                          'text-[10px] font-mono px-1.5 py-0.2 rounded-full border',
                          item.badgeVariant === 'warning'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20'
                        )}>
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-600 rounded-r-full" />
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}

            {/* Hardware & AP Telemetry Snippet */}
            {!collapsed && role === 'hr' && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    AP Gateways
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500">3 Online</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>HQ-North-5G</span>
                  <span className="text-emerald-400">412 dev</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F17]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Avatar
                size="sm"
                name={username || 'Admin'}
                status="online"
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white truncate capitalize">
                    {username || 'HR Officer'}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider truncate">
                    {role} • Authenticated
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTAINER ================= */}
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', collapsed ? 'pl-16' : 'pl-64')}>
        
        {/* TOPBAR */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F18]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
          
          {/* Left: Breadcrumbs & Live Pulse */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-slate-400 space-x-1.5">
              <span>Apex Enterprise</span>
              <span>/</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{currentTitle}</span>
            </div>
            
            <span className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800"></span>

            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Wi-Fi Sync Live</span>
            </div>
          </div>

          {/* Right: Omni Search, Theme, Notifications */}
          <div className="flex items-center space-x-2.5">
            
            {/* Omni Search Button / Bar */}
            <div className="relative hidden md:block w-64">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search staff, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-12 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition"
              />
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <kbd className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-slate-800 shadow-dropdown p-4 text-xs z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Telemetry Alerts</span>
                    <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">3 Unread</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Pending Leave: Marcus Brody</p>
                      <p className="text-[11px] text-slate-400">Annual leave request for Nov 20 - Nov 24 requires approval.</p>
                      <span className="text-[10px] font-mono text-slate-400">12m ago</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Hardware Gateway Alert</p>
                      <p className="text-[11px] text-slate-400">AP-HQ-NORTH operating at 84% capacity.</p>
                      <span className="text-[10px] font-mono text-slate-400">45m ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            {role === 'hr' && (
              <button
                onClick={() => navigate('/hr/add-user')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm shadow-brand-600/30 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Onboard</span>
              </button>
            )}

          </div>

        </header>

        {/* MAIN VIEW CONTENT */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  )
}
