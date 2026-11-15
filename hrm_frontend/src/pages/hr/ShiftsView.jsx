import React, { useState, useEffect } from 'react'
import { listShifts, createShift } from '../../api/shifts'
import {
  Layers,
  Clock,
  Plus,
  Users,
  AlertCircle,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react'

export default function ShiftsView() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    shift_type: 'FIXED',
    start_time: '09:00:00',
    end_time: '18:00:00',
    grace_period_minutes: 15,
    break_duration_minutes: 60,
    half_day_threshold_minutes: 240,
    full_day_threshold_minutes: 420,
    is_night_shift: false,
  })

  const loadData = () => {
    setLoading(true)
    listShifts()
      .then((res) => {
        setShifts(res.results || res || [])
      })
      .catch((err) => {
        console.error('Failed to load shifts:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createShift(form)
      setIsModalOpen(false)
      setForm({
        name: '',
        code: '',
        shift_type: 'FIXED',
        start_time: '09:00:00',
        end_time: '18:00:00',
        grace_period_minutes: 15,
        break_duration_minutes: 60,
        half_day_threshold_minutes: 240,
        full_day_threshold_minutes: 420,
        is_night_shift: false,
      })
      loadData()
    } catch (err) {
      alert('Failed to create shift: ' + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Shifts & Working Schedules</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define daily operating windows, arrival grace periods, unpaid break thresholds, and night shifts
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2"></div>
            Loading shift policies...
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white">{shift.name}</h2>
                    <span className="font-mono text-[10px] text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {shift.code}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                  {shift.assigned_count ?? 0} assigned
                </span>
              </div>

              {/* Timing metrics */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Working Hours:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Grace Period:</span>
                  <span className="font-mono text-emerald-500 font-medium">+{shift.grace_period_minutes}m buffer</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Lunch / Rest Break:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{shift.break_duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Full-Day Credit:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Min {Math.round(shift.full_day_threshold_minutes / 60)} hours</span>
                </div>
              </div>

              {shift.is_night_shift && (
                <div className="flex items-center space-x-1.5 text-[11px] text-indigo-400 font-medium">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night Shift • Crosses midnight (00:00)</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Shift Schedule</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Shift Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. European Overlap Shift"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Shift Code</label>
                <input
                  type="text"
                  required
                  placeholder="SH-EU-01"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={form.grace_period_minutes}
                    onChange={(e) => setForm({ ...form, grace_period_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300">Break Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={form.break_duration_minutes}
                    onChange={(e) => setForm({ ...form, break_duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="night"
                  checked={form.is_night_shift}
                  onChange={(e) => setForm({ ...form, is_night_shift: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <label htmlFor="night" className="text-slate-700 dark:text-slate-300">Crosses midnight (Night Shift)</label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
