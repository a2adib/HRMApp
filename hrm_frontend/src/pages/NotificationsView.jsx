import React, { useState, useEffect } from 'react'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  listAnnouncements,
  createAnnouncement
} from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import {
  Bell,
  CheckCircle2,
  Megaphone,
  Plus,
  Clock,
  Sparkles,
  Check
} from 'lucide-react'

export default function NotificationsView() {
  const { role } = useAuth()
  const isHR = (role || '').toLowerCase().includes('hr') || (role || '').toLowerCase().includes('admin')
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [annForm, setAnnForm] = useState({ title: '', content: '', is_pinned: true })

  const loadData = () => {
    setLoading(true)
    Promise.all([listNotifications(), listAnnouncements()])
      .then(([notifRes, annRes]) => {
        setNotifications(notifRes.results || notifRes || [])
        setAnnouncements(annRes.results || annRes || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      await createAnnouncement(annForm)
      setIsModalOpen(false)
      setAnnForm({ title: '', content: '', is_pinned: true })
      loadData()
    } catch (err) {
      alert('Failed to publish announcement.')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Communications & Alerts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Company broadcasts, system telemetry alerts, and personal attendance notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          {isHR && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast Notice</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Official Announcements */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Company Announcements</h2>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-slate-400 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 text-xs">
                No active announcements published.
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                      {ann.is_pinned && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{ann.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(ann.publish_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                  <div className="pt-2 text-[10px] text-slate-400 flex justify-between">
                    <span>By: {ann.publisher_name || 'Executive Staff'}</span>
                    <span>{ann.department_name ? ann.department_name : 'All Staff'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Personal Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity & Alerts</h2>
          </div>

          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 text-xs">
                No new notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition flex items-start justify-between space-x-3 text-xs ${
                    n.is_read
                      ? 'bg-white dark:bg-[#0D1017] border-slate-200 dark:border-slate-800 text-slate-500'
                      : 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center space-x-2">
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span>}
                      <span>{n.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{n.message}</p>
                    <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[10px] text-brand-600 hover:text-brand-500 font-medium shrink-0 pt-0.5"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Broadcast Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health & Safety Protocol Update"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Message Content</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Announcement body text..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pin"
                  checked={annForm.is_pinned}
                  onChange={(e) => setAnnForm({ ...annForm, is_pinned: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <label htmlFor="pin" className="text-slate-700 dark:text-slate-300">Pin announcement to top of dashboard</label>
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
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
