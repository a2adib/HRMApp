import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui/avatar'
import { StatusBadge } from '../../components/ui/status-badge'
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  Wifi,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react'

export default function EmployeeProfile() {
  const { user } = useAuth()
  const [successMsg, setSuccessMsg] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const emp = user?.employee || {
    first_name: 'Alex',
    last_name: 'Rivera',
    employee_code: 'EMP-003',
    department_name: 'Engineering',
    designation_title: 'Senior Frontend Engineer',
    email: user?.email || 'alex.rivera@acme-corp.com',
    phone_number: '+1 (555) 234-5678',
    date_of_joining: '2024-03-01',
    office_name: 'Global HQ - Manhattan',
    network_username: 'alex.rivera',
    mac_address: '4A:7B:9C:12:34:56'
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setUpdatingPassword(true)
    setTimeout(() => {
      setUpdatingPassword(false)
      setSuccessMsg('Your security credentials have been updated.')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setSuccessMsg(''), 4000)
    }, 600)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={`${emp.first_name} ${emp.last_name}`} size="lg" className="w-20 h-20 text-2xl shadow-md" />
          
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {emp.first_name} {emp.last_name}
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {emp.employee_code}
              </span>
              <StatusBadge status="ACTIVE" />
            </div>

            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
              {emp.designation_title || 'Senior Software Engineer'} • {emp.department_name || 'Engineering'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || 'alex.rivera@acme-corp.com'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {emp.phone_number || '+1 (555) 234-5678'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {emp.office_name || 'Global HQ - Manhattan'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Employment Details & Wi-Fi Tracking Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Employment Topology */}
        <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Briefcase className="w-5 h-5 text-brand-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Employment Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{emp.department_name || 'Engineering'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Designation</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{emp.designation_title || 'Senior Software Engineer'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Reporting Manager</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">Marcus Brody</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Joining Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">{emp.date_of_joining || '2024-03-01'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Shift Schedule</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">Standard Day (09:00 - 18:00)</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Employment Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">Full-Time Regular</span>
            </div>
          </div>
        </div>

        {/* Wi-Fi & Device Authentication Identity */}
        <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Wifi className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Wi-Fi Attendance Identity</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">802.1X RADIUS Username</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-sm block">
                {emp.network_username || 'alex.rivera'}
              </span>
              <span className="text-[11px] text-slate-400">Used by access points to match active sessions</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Registered Device MAC Address</span>
              <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 text-sm block">
                {emp.mac_address || '4A:7B:9C:12:34:56'}
              </span>
              <span className="text-[11px] text-slate-400">Primary corporate workstation NIC</span>
            </div>
          </div>
        </div>

      </div>

      {/* Security & Password Change */}
      <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Security & Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your account authentication credentials</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

    </div>
  )
}
