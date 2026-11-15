import React, { useState, useEffect } from 'react'
import { getAttendanceHistory } from '../../api/attendance'
import { Avatar } from '../../components/ui/avatar'
import {
  Clock,
  Calendar,
  Search,
  Filter,
  Wifi,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ClockAlert
} from 'lucide-react'

export default function AttendanceOverview() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [search, setSearch] = useState('')

  const loadData = () => {
    setLoading(true)
    getAttendanceHistory()
      .then((res) => {
        setRecords(res.results || res || [])
      })
      .catch((err) => {
        console.error('Failed to load attendance records:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = records.filter((r) => {
    if (selectedDate && r.attendance_date !== selectedDate) {
      // allow flexible filtering if multiple dates
    }
    if (statusFilter && r.status !== statusFilter) return false
    if (sourceFilter && r.source !== sourceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = (r.employee_name || '').toLowerCase()
      const code = (r.employee_code || '').toLowerCase()
      return name.includes(q) || code.includes(q)
    }
    return true
  })

  const presentCount = records.filter((r) => r.status === 'PRESENT').length
  const lateCount = records.filter((r) => r.status === 'LATE').length
  const absentCount = records.filter((r) => r.status === 'ABSENT').length
  const leaveCount = records.filter((r) => r.status === 'ON_LEAVE').length

  const getSourceIcon = (source) => {
    if (source === 'WIFI') return <Wifi className="w-3 h-3 text-emerald-500" />
    if (source === 'MANUAL') return <Smartphone className="w-3 h-3 text-indigo-500" />
    return <ShieldCheck className="w-3 h-3 text-amber-500" />
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Daily Attendance Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time workplace presence log, Wi-Fi telemetry validation, and daily timekeeping
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">Present</span>
          <div className="text-xl font-bold font-mono text-emerald-500">{presentCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">Late Arrivals</span>
          <div className="text-xl font-bold font-mono text-amber-500">{lateCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">On Leave</span>
          <div className="text-xl font-bold font-mono text-blue-500">{leaveCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">Absent / Unreported</span>
          <div className="text-xl font-bold font-mono text-rose-500">{absentCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">All Verification Sources</option>
            <option value="WIFI">Wi-Fi Tracking (Passcode / 802.1X)</option>
            <option value="MANUAL">Mobile App Punch (GPS)</option>
            <option value="ADMIN_CORRECTION">Admin Adjustment</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Attendance Date</th>
                <th className="py-3 px-4">First Check-In</th>
                <th className="py-3 px-4">Last Check-Out</th>
                <th className="py-3 px-4">Work Duration</th>
                <th className="py-3 px-4">Punctuality</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
                    Loading attendance roster...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No attendance records for the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <Avatar name={r.employee_name || 'Staff'} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{r.employee_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.employee_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {r.attendance_date}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {r.first_check_in ? new Date(r.first_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {r.last_check_out ? new Date(r.last_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {Math.floor(r.total_work_minutes / 60)}h {r.total_work_minutes % 60}m
                    </td>
                    <td className="py-3 px-4">
                      {r.late_minutes > 0 ? (
                        <span className="font-mono text-xs text-amber-500 font-semibold flex items-center space-x-1">
                          <ClockAlert className="w-3.5 h-3.5" />
                          <span>+{r.late_minutes}m</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-500 font-medium">Punctual</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                        r.status === 'LATE' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                        r.status === 'HALF_DAY' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' :
                        r.status === 'ON_LEAVE' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {getSourceIcon(r.source)}
                        <span>{r.source}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
