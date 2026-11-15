import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmployee } from '../../api/employees'
import { getMonthlyAttendance } from '../../api/attendance'
import { listLeaveBalances } from '../../api/leaves'
import { Avatar } from '../../components/ui/avatar'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  Clock,
  Wifi,
  Shield,
  CalendarRange,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function EmployeeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [leaveBalances, setLeaveBalances] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getEmployee(id),
      getMonthlyAttendance({ employee_id: id }),
      listLeaveBalances({ employee: id }),
    ])
      .then(([empRes, attRes, balRes]) => {
        setEmployee(empRes)
        setAttendance(attRes)
        setLeaveBalances(balRes.results || balRes || [])
      })
      .catch((err) => {
        console.error('Failed to load employee details:', err)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-400">Employee profile not found.</p>
        <button
          onClick={() => navigate('/hr/employees')}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Return to Directory
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Back button & Hero Header */}
      <div>
        <button
          onClick={() => navigate('/hr/employees')}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Staff Directory</span>
        </button>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar name={`${employee.first_name} ${employee.last_name}`} src={employee.avatar_url} size="lg" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {employee.first_name} {employee.last_name}
                </h1>
                <span className="font-mono text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-500/20">
                  {employee.employee_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {employee.designation_title} • {employee.department_name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
              employee.employment_status === 'ACTIVE'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {employee.employment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'profile'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Profile Dossier
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'attendance'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Attendance History
          {activeTab === 'attendance' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'leaves'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Leave Balances
          {activeTab === 'leaves' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>
      </div>

      {/* Tab 1: Profile Dossier */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employment Details</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-900 dark:text-white">{employee.department_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Designation</span>
                <span className="font-medium text-slate-900 dark:text-white">{employee.designation_title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Office Base</span>
                <span className="font-medium text-slate-900 dark:text-white">{employee.office_name || 'Main Office'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-medium text-slate-900 dark:text-white">{employee.manager_name || 'Executive Direct'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-mono text-slate-900 dark:text-white">{employee.joining_date}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Connectivity & Contact</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Official Email</span>
                <span className="font-mono text-slate-900 dark:text-white">{employee.work_email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-mono text-slate-900 dark:text-white">{employee.phone_number || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">RADIUS 802.1X Identity</span>
                <span className="inline-flex items-center space-x-1 font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                  <Wifi className="w-3 h-3" />
                  <span>{employee.network_username || 'Not assigned'}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Days Present</span>
              <div className="text-xl font-bold font-mono text-emerald-500">{attendance?.summary?.present_days ?? 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Days Late</span>
              <div className="text-xl font-bold font-mono text-amber-500">{attendance?.summary?.late_days ?? 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Days Absent</span>
              <div className="text-xl font-bold font-mono text-rose-500">{attendance?.summary?.absent_days ?? 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Total Hours</span>
              <div className="text-xl font-bold font-mono text-brand-500">{attendance?.summary?.total_work_hours ?? 0}h</div>
            </div>
          </div>

          {/* Records Table */}
          <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Check-In</th>
                  <th className="py-2.5 px-4">Check-Out</th>
                  <th className="py-2.5 px-4">Work Time</th>
                  <th className="py-2.5 px-4">Late</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(attendance?.records || []).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">{r.attendance_date}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{r.first_check_in ? new Date(r.first_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{r.last_check_out ? new Date(r.last_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">{Math.floor(r.total_work_minutes / 60)}h {r.total_work_minutes % 60}m</td>
                    <td className="py-2.5 px-4 font-mono text-amber-500">{r.late_minutes > 0 ? `${r.late_minutes}m` : '0m'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                        r.status === 'LATE' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Balances */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {leaveBalances.map((bal) => (
            <div key={bal.id} className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{bal.leave_type_name}</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {bal.leave_type_code}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-mono text-brand-600 dark:text-brand-400">
                  {bal.remaining_days}
                </span>
                <span className="text-xs text-slate-400">/ {bal.allocated_days} days left</span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{bal.used_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending approval:</span>
                  <span className="font-mono text-amber-500">{bal.pending_days} days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
