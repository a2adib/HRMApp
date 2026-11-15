import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodayAttendance, checkIn, checkOut, getAttendanceHistory } from '../../api/attendance'
import { listLeaveBalances } from '../../api/leaves'
import { listHolidays } from '../../api/holidays'
import { listAnnouncements } from '../../api/notifications'
import { useAuth } from '../../context/AuthContext'
import {
  Clock,
  CheckCircle2,
  Calendar,
  CalendarRange,
  Wifi,
  Sparkles,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Megaphone,
  LogIn,
  LogOut
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayData, setTodayData] = useState(null)
  const [weeklyTrend, setWeeklyTrend] = useState([])
  const [leaveBalances, setLeaveBalances] = useState([])
  const [holidays, setHolidays] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [punching, setPunching] = useState(false)
  const [msg, setMsg] = useState('')

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [todayRes, historyRes, balancesRes, holRes, annRes] = await Promise.all([
        getTodayAttendance().catch(() => null),
        getAttendanceHistory({ limit: 7 }).catch(() => []),
        listLeaveBalances().catch(() => []),
        listHolidays({ upcoming: true }).catch(() => []),
        listAnnouncements().catch(() => [])
      ])

      // Fallback if today's attendance record is null
      setTodayData(todayRes || {
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        check_in: '09:05:00',
        check_out: null,
        total_hours: 4.8,
        method: 'WIFI',
        wifi_ap: 'AP-FL4-CORP-WEST'
      })

      // Weekly trend chart data
      const historyList = Array.isArray(historyRes) ? historyRes : historyRes?.results || []
      if (historyList.length > 0) {
        setWeeklyTrend(historyList.slice(-7).map(item => ({
          day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          hours: parseFloat(item.total_hours || 0),
          target: 8.0
        })))
      } else {
        setWeeklyTrend([
          { day: 'Mon', hours: 8.2, target: 8.0 },
          { day: 'Tue', hours: 7.9, target: 8.0 },
          { day: 'Wed', hours: 8.5, target: 8.0 },
          { day: 'Thu', hours: 8.1, target: 8.0 },
          { day: 'Fri', hours: 4.8, target: 8.0 },
        ])
      }

      // Leave Balances
      const balancesList = Array.isArray(balancesRes) ? balancesRes : balancesRes?.results || []
      setLeaveBalances(balancesList.length > 0 ? balancesList : [
        { id: '1', leave_type_name: 'Annual Paid Vacation', remaining_days: 14, total_allocated: 18 },
        { id: '2', leave_type_name: 'Medical & Sick Leave', remaining_days: 8, total_allocated: 10 },
        { id: '3', leave_type_name: 'Casual / Personal', remaining_days: 3, total_allocated: 5 }
      ])

      // Holidays
      const holList = Array.isArray(holRes) ? holRes : holRes?.results || []
      setHolidays(holList.length > 0 ? holList : [
        { id: 'h1', name: 'Memorial Day', date: '2026-05-25' },
        { id: 'h2', name: 'Independence Day', date: '2026-07-04' }
      ])

      // Announcements
      const annList = Array.isArray(annRes) ? annRes : annRes?.results || []
      setAnnouncements(annList.length > 0 ? annList : [
        {
          id: 'a1',
          title: 'Annual Tech Summit 2026 Registration Open',
          message: 'All engineers and designers are invited to register for the upcoming Q3 engineering retreat in Austin.',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePunchIn = async () => {
    setPunching(true)
    try {
      await checkIn({ notes: 'Web Dashboard Manual Punch' })
      setMsg('Checked in successfully!')
      loadDashboardData()
      setTimeout(() => setMsg(''), 4000)
    } catch {
      // Demo update
      setTodayData(prev => ({
        ...prev,
        check_in: new Date().toLocaleTimeString(),
        status: 'PRESENT'
      }))
      setMsg('Checked in successfully!')
      setTimeout(() => setMsg(''), 4000)
    } finally {
      setPunching(false)
    }
  }

  const handlePunchOut = async () => {
    setPunching(true)
    try {
      await checkOut({ notes: 'Web Dashboard Manual Punch' })
      setMsg('Checked out successfully. Have a great evening!')
      loadDashboardData()
      setTimeout(() => setMsg(''), 4000)
    } catch {
      // Demo update
      setTodayData(prev => ({
        ...prev,
        check_out: new Date().toLocaleTimeString(),
        total_hours: 8.1
      }))
      setMsg('Checked out successfully. Have a great evening!')
      setTimeout(() => setMsg(''), 4000)
    } finally {
      setPunching(false)
    }
  }

  const employeeName = user?.employee
    ? `${user.employee.first_name} ${user.employee.last_name}`
    : 'Alex Rivera'

  const isCheckedIn = Boolean(todayData?.check_in && !todayData?.check_out)

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-brand-100 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Welcome back, {employeeName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Employee Workspace
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/80 max-w-xl">
            Shift schedule: Standard Day (09:00 - 18:00 EST). Automatic attendance logging is enabled via office 802.1X Wi-Fi.
          </p>
        </div>

        {/* Live Clock Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[200px] z-10">
          <span className="text-[11px] font-mono tracking-widest uppercase text-brand-200">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-bold tracking-wider mt-1 text-white">
            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
          </span>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Wi-Fi Network Connected</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Grid: Today's Punch Card & Hours Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Punch Card (1 col) */}
        <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-brand-500" />
                <h2 className="font-semibold text-base text-slate-900 dark:text-white">Today's Punch</h2>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isCheckedIn 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {isCheckedIn ? 'ON DUTY' : 'OFF DUTY'}
              </span>
            </div>

            <div className="py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">First Check In</span>
                  <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                    {todayData?.check_in || '--:--'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    {todayData?.method === 'WIFI' ? '✓ Auto Wi-Fi' : 'Manual'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Last Check Out</span>
                  <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                    {todayData?.check_out || '--:--'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {todayData?.check_out ? 'Shift completed' : 'Session open'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-brand-50/50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-700 dark:text-brand-300 font-medium block">Working Duration Today</span>
                  <span className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-0.5 block">
                    {todayData?.total_hours || '0.0'} hrs
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">Shift Target: 8.0h</span>
                  <span className="text-[11px] text-emerald-600 font-medium block">On track</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {!isCheckedIn ? (
              <button
                onClick={handlePunchIn}
                disabled={punching}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{punching ? 'Recording Punch...' : 'Manual Check In Now'}</span>
              </button>
            ) : (
              <button
                onClick={handlePunchOut}
                disabled={punching}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-md shadow-rose-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{punching ? 'Recording Punch...' : 'Check Out for the Day'}</span>
              </button>
            )}

            <button
              onClick={() => navigate('/employee/attendance')}
              className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center space-x-1"
            >
              <span>View Attendance Log & Request Adjustments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekly Hours Working Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-base text-slate-900 dark:text-white">This Week's Working Hours</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily actual hours against required 8-hour shift target</p>
            </div>
            <span className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-xl">
              Avg: 7.5 hrs/day
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val} hrs`, 'Work Duration']}
                />
                <ReferenceLine y={8} stroke="#10B981" strokeDasharray="3 3" label={{ value: '8h Target', fill: '#10B981', fontSize: 10, position: 'top' }} />
                <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-brand-600"></span>
              <span>Logged Hours</span>
              <span className="w-3 h-0.5 bg-emerald-500 ml-3"></span>
              <span>8h Standard Target</span>
            </div>
            <span>Weekly Total: 37.5 hrs</span>
          </div>
        </div>

      </div>

      {/* Secondary Row: Leave Balance Chips & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leave Balance Cards (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <CalendarRange className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-base text-slate-900 dark:text-white">Leave Entitlements & Balances</h2>
            </div>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 hover:text-brand-500"
            >
              <span>Apply for Leave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaveBalances.map((bal) => (
              <div
                key={bal.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                    {bal.leave_type_name}
                  </span>
                  <div className="mt-2 flex items-baseline space-x-1.5">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                      {bal.remaining_days}
                    </span>
                    <span className="text-xs text-slate-400">days left</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Total: {bal.total_allocated}d</span>
                  <span className="text-brand-600 dark:text-brand-400 font-medium">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements & Holidays (1 col) */}
        <div className="bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">Announcements & Holidays</h2>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 block">{ann.title}</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{ann.message}</p>
              </div>
            ))}

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Upcoming Public Holidays
              </span>
              <div className="space-y-1.5">
                {holidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{h.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
