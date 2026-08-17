import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleNav = {
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'Leave Request', path: '/employee/leave-request' },
    { label: 'Attendance', path: '/employee/attendance' },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard' },
    { label: 'Leave Request', path: '/manager/leave-request' },
    { label: 'Leave Approval', path: '/manager/leave-approval' },
    { label: 'Attendance', path: '/manager/attendance' },
    { label: 'Employees', path: '/manager/employees' },
  ],
  hr: [
    { label: 'Dashboard', path: '/hr/dashboard' },
    { label: 'Add User', path: '/hr/add-user' },
    { label: 'All Attendance', path: '/hr/attendance' },
    { label: 'Leave Approval', path: '/hr/leave-approval' },
    { label: 'Users', path: '/hr/users' },
    { label: 'Export', path: '/hr/export' },
  ],
}

export default function Layout({ children }) {
  const { role, username, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const navItems = useMemo(() => roleNav[role] || [], [role])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-indigo-800 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-indigo-700">
          <h1 className="text-lg font-bold">HRM App</h1>
          <p className="text-sm text-indigo-200 capitalize">{role}: {username}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded text-sm transition ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm rounded bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
