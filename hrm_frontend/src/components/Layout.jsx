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
  Wifi,
  CalendarRange,
  ClockAlert,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'
import { Avatar } from './ui/avatar'
import { cn } from '../lib/utils'

export default function Layout({ children }) {
  const { role, user, username, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [searchQuery, setSearchQuery] = useState('')
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Role-based navigation definition
  const navSections = useMemo(() => {
    const normalizedRole = (role || 'hr').toLowerCase()

    if (normalizedRole === 'hr' || normalizedRole === 'hr_admin' || normalizedRole === 'super_admin') {
      return [
        {
          title: 'Workforce Operations',
          items: [
            { label: 'Executive Overview', path: '/hr/dashboard', icon: LayoutDashboard },
            { label: 'Employees', path: '/hr/employees', icon: Users, badge: 'Active' },
            { label: 'Daily Attendance', path: '/hr/attendance', icon: Clock },
            { label: 'Attendance Corrections', path: '/hr/attendance-corrections', icon: ClockAlert, badge: 'Queue', badgeVariant: 'warning' },
            { label: 'Leave Management', path: '/hr/leaves', icon: CalendarRange, badge: 'Requests', badgeVariant: 'brand' },
          ]
        },
        {
          title: 'Organization Topology',
          items: [
            { label: 'Departments & Hierarchy', path: '/hr/departments', icon: Building2 },
            { label: 'Shifts & Schedules', path: '/hr/shifts', icon: Layers },
            { label: 'Holidays Calendar', path: '/hr/holidays', icon: Calendar },
          ]
        },
        {
          title: 'Infrastructure & Governance',
          items: [
            { label: 'Wi-Fi Attendance Settings', path: '/hr/wifi-settings', icon: Wifi },
            { label: 'Reports & Analytics', path: '/hr/reports', icon: FileBarChart },
            { label: 'Audit Log Explorer', path: '/hr/audit-logs', icon: ShieldCheck },
            { label: 'User Roles & Access', path: '/hr/users', icon: UserPlus },
            { label: 'Organization Settings', path: '/hr/settings', icon: Settings },
          ]
        }
      ]
    }

    if (normalizedRole === 'manager') {
      return [
        {
          title: 'Team Management',
          items: [
            { label: 'Manager Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
            { label: 'Team Members', path: '/manager/employees', icon: Users },
            { label: 'Team Attendance', path: '/manager/attendance', icon: Clock },
            { label: 'Leave Approvals', path: '/manager/leave-approvals', icon: CalendarRange, badge: 'Pending', badgeVariant: 'brand' },
            { label: 'Attendance Corrections', path: '/manager/attendance-corrections', icon: ClockAlert },
          ]
        },
        {
          title: 'Personal',
          items: [
            { label: 'Notifications', path: '/notifications', icon: Bell },
          ]
        }
      ]
    }

    // Default Employee Portal
    return [
      {
        title: 'Employee Self-Service',
        items: [
          { label: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { label: 'My Attendance & Punches', path: '/employee/attendance', icon: Clock },
          { label: 'Leave Applications', path: '/employee/leaves', icon: CalendarRange },
          { label: 'Notifications', path: '/notifications', icon: Bell },
          { label: 'My Profile & Settings', path: '/employee/profile', icon: Settings },
        ]
      }
    ]
  }, [role])

  const displayName = user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : (username || 'Sarah Jenkins')
  const displayRole = (role || 'HR_ADMIN').toUpperCase()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={cn(
          "flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1017] transition-all duration-300 z-30 select-none",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-600/20 shrink-0">
              HR
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white truncate">Acme Global</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">HR Platform v1.0</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative",
                      isActive 
                        ? "bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0 transition", isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200")} />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium",
                        item.badgeVariant === 'warning'
                          ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : item.badgeVariant === 'brand'
                          ? "bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Avatar name={displayName} size="sm" status="online" />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{displayName}</span>
                  <span className="text-[10px] text-slate-400 truncate">{displayRole}</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button 
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP APP BAR */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0D1017]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
          
          {/* Breadcrumb / Location Header */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Portal</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
              {location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || 'Dashboard'}
            </span>
            <span className="ml-3 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Wi-Fi Gateway Active</span>
            </span>
          </div>

          {/* Right Tools: Omni Search, Theme, Notifications */}
          <div className="flex items-center space-x-2.5">
            
            {/* Search Input */}
            <div className="relative hidden md:block w-56">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search staff, code, AP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition"
              />
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
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
            </button>

            {/* Quick Action */}
            <button
              onClick={() => navigate('/hr/employees')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm shadow-brand-600/30 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Employees</span>
            </button>

          </div>

        </header>

        {/* MAIN VIEW CONTENT CONTAINER */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  )
}
