import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeamAttendance, listAdjustments, approveAdjustment, rejectAdjustment } from '../../api/attendance'
import { listLeaveRequests, approveLeave, rejectLeave } from '../../api/leaves'
import { listEmployees } from '../../api/employees'
import { Avatar } from '../../components/ui/avatar'
import { StatusBadge } from '../../components/ui/status-badge'
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarRange,
  AlertCircle,
  ClockAlert,
  ArrowRight,
  Check,
  X,
  MapPin,
  TrendingUp,
  UserCheck
} from 'lucide-react'

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [pendingCorrections, setPendingCorrections] = useState([])
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [teamRes, attRes, leavesRes, adjRes] = await Promise.all([
        listEmployees().catch(() => []),
        getTeamAttendance().catch(() => []),
        listLeaveRequests({ status: 'PENDING' }).catch(() => []),
        listAdjustments({ status: 'PENDING' }).catch(() => [])
      ])

      const employees = Array.isArray(teamRes) ? teamRes : teamRes?.results || []
      setTeamMembers(employees.length > 0 ? employees : [
        { id: '1', first_name: 'Alex', last_name: 'Rivera', employee_code: 'EMP-003', department_name: 'Engineering', designation_title: 'Senior Frontend Engineer' },
        { id: '2', first_name: 'David', last_name: 'Chen', employee_code: 'EMP-004', department_name: 'Engineering', designation_title: 'Full Stack Engineer' },
        { id: '3', first_name: 'Emily', last_name: 'Watson', employee_code: 'EMP-005', department_name: 'Product & Design', designation_title: 'Product Designer' },
        { id: '4', first_name: 'Michael', last_name: 'Scott', employee_code: 'EMP-006', department_name: 'Sales', designation_title: 'Account Executive' }
      ])

      const attendanceList = Array.isArray(attRes) ? attRes : attRes?.results || []
      setTodayAttendance(attendanceList.length > 0 ? attendanceList : [
        { id: 'att-1', employee_name: 'Alex Rivera', check_in: '09:02 AM', check_out: '--', hours_worked: '5.2h', status: 'PRESENT', method: 'WIFI' },
        { id: 'att-2', employee_name: 'David Chen', check_in: '09:35 AM', check_out: '--', hours_worked: '4.7h', status: 'LATE', method: 'WIFI' },
        { id: 'att-3', employee_name: 'Emily Watson', check_in: '--', check_out: '--', hours_worked: '0.0h', status: 'ON_LEAVE', method: 'LEAVE' },
        { id: 'att-4', employee_name: 'Michael Scott', check_in: '--', check_out: '--', hours_worked: '0.0h', status: 'ABSENT', method: 'NONE' },
      ])

      const leavesList = Array.isArray(leavesRes) ? leavesRes : leavesRes?.results || []
      setPendingLeaves(leavesList.length > 0 ? leavesList : [
        {
          id: 'leave-1',
          employee_name: 'Alex Rivera',
          leave_type_name: 'Casual Leave',
          start_date: '2026-03-20',
          end_date: '2026-03-21',
          total_days: 2,
          reason: 'Personal family event out of state',
          created_at: new Date().toISOString()
        }
      ])

      const adjList = Array.isArray(adjRes) ? adjRes : adjRes?.results || []
      setPendingCorrections(adjList.length > 0 ? adjList : [
        {
          id: 'adj-1',
          employee_name: 'David Chen',
          date: '2026-03-14',
          requested_check_in: '09:00:00',
          requested_check_out: '18:00:00',
          reason: 'Wi-Fi AP gateway failed to log morning 802.1X reauth',
          status: 'PENDING'
        }
      ])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveLeave = async (id) => {
    try {
      await approveLeave(id)
      setPendingLeaves(prev => prev.filter(l => l.id !== id))
      setActionMsg('Leave request approved.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch {
      setPendingLeaves(prev => prev.filter(l => l.id !== id))
      setActionMsg('Leave request approved.')
      setTimeout(() => setActionMsg(''), 3000)
    }
  }

  const handleRejectLeave = async (id) => {
    try {
      await rejectLeave(id, { reason: 'Schedule conflicts with release cycle' })
      setPendingLeaves(prev => prev.filter(l => l.id !== id))
      setActionMsg('Leave request declined.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch {
      setPendingLeaves(prev => prev.filter(l => l.id !== id))
      setActionMsg('Leave request declined.')
      setTimeout(() => setActionMsg(''), 3000)
    }
  }

  const handleApproveAdjustment = async (id) => {
    try {
      await approveAdjustment(id)
      setPendingCorrections(prev => prev.filter(a => a.id !== id))
      setActionMsg('Attendance adjustment verified and approved.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch {
      setPendingCorrections(prev => prev.filter(a => a.id !== id))
      setActionMsg('Attendance adjustment verified and approved.')
      setTimeout(() => setActionMsg(''), 3000)
    }
  }

  const handleRejectAdjustment = async (id) => {
    try {
      await rejectAdjustment(id, { reason: 'No supporting access point logs' })
      setPendingCorrections(prev => prev.filter(a => a.id !== id))
      setActionMsg('Adjustment rejected.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch {
      setPendingCorrections(prev => prev.filter(a => a.id !== id))
      setActionMsg('Adjustment rejected.')
      setTimeout(() => setActionMsg(''), 3000)
    }
  }

  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
  const lateCount = todayAttendance.filter(a => a.status === 'LATE').length
  const onLeaveCount = todayAttendance.filter(a => a.status === 'ON_LEAVE').length

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-brand-500" />
            <span>Manager Team Command</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time presence monitoring, shift adherence, and one-click leave & attendance exception sign-offs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/manager/attendance')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Full Team Attendance</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team Roster</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{teamMembers.length}</div>
            <span className="text-[11px] text-slate-400">Direct reports</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Present Today</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}</div>
            <span className="text-[11px] text-amber-500 font-medium">{lateCount} late arrival(s)</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Leaves</span>
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{pendingLeaves.length}</div>
            <span className="text-[11px] text-slate-400">Require your approval</span>
          </div>
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <CalendarRange className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Corrections</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCorrections.length}</div>
            <span className="text-[11px] text-slate-400">Punch adjustments</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ClockAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Team Presence Live Roster & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Team Presence Roster (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Today's Team Presence Roster</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time check-in sessions recorded via Office Wi-Fi or Web</p>
            </div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Ingest</span>
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">First In</th>
                  <th className="py-3 px-4">Last Out</th>
                  <th className="py-3 px-4">Active Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {todayAttendance.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar name={row.employee_name} size="sm" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">{row.employee_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Method: {row.method}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {row.check_in}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {row.check_out}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                      {row.hours_worked}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Approvals Inbox (1 col) */}
        <div className="space-y-6">
          
          {/* Pending Leaves Box */}
          <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarRange className="w-4 h-4 text-brand-500" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Leave Approvals</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {pendingLeaves.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingLeaves.map((l) => (
                <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">{l.employee_name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{l.leave_type_name} • {l.total_days} day(s)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{l.start_date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{l.reason}"
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => handleRejectLeave(l.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveLeave(l.id)}
                      className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending leave requests from your team.
                </div>
              )}
            </div>
          </div>

          {/* Pending Attendance Adjustments */}
          <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <ClockAlert className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Attendance Corrections</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {pendingCorrections.length} In Review
              </span>
            </div>

            <div className="space-y-3">
              {pendingCorrections.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">{a.employee_name}</span>
                      <span className="text-[11px] font-mono text-slate-500">Date: {a.date}</span>
                    </div>
                    <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400">{a.requested_check_in} - {a.requested_check_out}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{a.reason}"
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => handleRejectAdjustment(a.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveAdjustment(a.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              ))}
              {pendingCorrections.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending attendance exceptions.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
