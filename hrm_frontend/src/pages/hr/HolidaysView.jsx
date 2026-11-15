import React, { useState, useEffect } from 'react'
import { listHolidays, createHoliday, deleteHoliday } from '../../api/holidays'
import { listOffices } from '../../api/organizations'
import {
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react'

export default function HolidaysView() {
  const [holidays, setHolidays] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    holiday_date: '',
    is_recurring: false,
    office: '',
    description: '',
  })

  const loadData = () => {
    setLoading(true)
    Promise.all([listHolidays(), listOffices()])
      .then(([holRes, offRes]) => {
        setHolidays(holRes.results || holRes || [])
        setOffices(offRes.results || offRes || [])
      })
      .catch((err) => {
        console.error('Failed to load holidays:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      if (!payload.office) delete payload.office
      await createHoliday(payload)
      setIsModalOpen(false)
      setForm({ name: '', holiday_date: '', is_recurring: false, office: '', description: '' })
      loadData()
    } catch (err) {
      alert('Failed to save holiday: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Remove this official holiday?')) {
      try {
        await deleteHoliday(id)
        loadData()
      } catch (err) {
        alert('Failed to delete holiday.')
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Company Holidays & Non-Working Days</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish organization-wide statutory holidays and location-specific calendar exceptions
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Holiday</span>
        </button>
      </div>

      {/* Holidays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2"></div>
            Loading holidays calendar...
          </div>
        ) : holidays.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
            No holidays registered for this calendar cycle.
          </div>
        ) : (
          holidays.map((h) => (
            <div
              key={h.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</h2>
                  <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold block mt-0.5">
                    {new Date(h.holiday_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {h.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{h.description}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{h.office_name ? h.office_name : 'All Offices (Company-wide)'}</span>
                </span>
                {h.is_recurring && (
                  <span className="text-emerald-500 font-medium">Annual Recurring</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Calendar Holiday</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Holiday Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Observed Date</label>
                <input
                  type="date"
                  required
                  value={form.holiday_date}
                  onChange={(e) => setForm({ ...form, holiday_date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Applicable Facility (Optional)</label>
                <select
                  value={form.office}
                  onChange={(e) => setForm({ ...form, office: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="">All Offices (Company-wide)</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional context or administrative notes..."
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={form.is_recurring}
                  onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <label htmlFor="recurring" className="text-slate-700 dark:text-slate-300">Repeats every calendar year</label>
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
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
