import React, { useState, useEffect } from 'react'
import { listAdjustments, approveAdjustment, rejectAdjustment } from '../../api/attendance'
import { Avatar } from '../../components/ui/avatar'
import {
  ClockAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react'

export default function AttendanceCorrections() {
  const [adjustments, setAdjustments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [reviewNotes, setReviewNotes] = useState({})
  const [actionLoading, setActionLoading] = useState({})

  const loadData = () => {
    setLoading(true)
    listAdjustments(statusFilter ? { review_status: statusFilter } : {})
      .then((res) => {
        setAdjustments(res.results || res || [])
      })
      .catch((err) => {
        console.error('Failed to load adjustments:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await approveAdjustment(id, { review_notes: reviewNotes[id] || 'Approved by HR Administrator.' })
      loadData()
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleReject = async (id) => {
    if (!reviewNotes[id]) {
      alert('Please provide a reason or note when rejecting an adjustment ticket.')
      return
    }
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await rejectAdjustment(id, { review_notes: reviewNotes[id] })
      loadData()
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Corrections Queue</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review and adjudicate employee punch adjustments, hardware outage claims, and timing overrides
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Review Statuses</option>
            <option value="PENDING">Pending Review (Actionable)</option>
            <option value="APPROVED">Approved Corrections</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
            Loading adjustment queue...
          </div>
        ) : adjustments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-medium text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">There are no {statusFilter.toLowerCase()} attendance adjustment requests in the queue.</p>
          </div>
        ) : (
          adjustments.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center space-x-3">
                  <Avatar name={ticket.employee_name || 'Staff'} size="sm" />
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {ticket.employee_name}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">
                      Ticket #{ticket.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  ticket.review_status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  ticket.review_status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  'bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {ticket.review_status}
                </span>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Original State */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Original Logged Record
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.original_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Check-In:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {ticket.original_check_in ? new Date(ticket.original_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Check-Out:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {ticket.original_check_out ? new Date(ticket.original_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requested State */}
                <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-800/40 space-y-2">
                  <div className="text-[10px] font-semibold tracking-wider text-brand-600 dark:text-brand-400 uppercase">
                    Proposed Correction
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposed Status:</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{ticket.requested_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposed In:</span>
                      <span className="font-mono text-brand-600 dark:text-brand-400">
                        {ticket.requested_check_in ? new Date(ticket.requested_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Keep existing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposed Out:</span>
                      <span className="font-mono text-brand-600 dark:text-brand-400">
                        {ticket.requested_check_out ? new Date(ticket.requested_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Keep existing'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Justification Reason */}
              <div className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Staff Justification: </span>
                <span className="text-slate-600 dark:text-slate-400">{ticket.reason}</span>
              </div>

              {/* Actions & Notes for Pending Tickets */}
              {ticket.review_status === 'PENDING' && (
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Administrative review remarks or decision notes..."
                    value={reviewNotes[ticket.id] || ''}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [ticket.id]: e.target.value })}
                    className="flex-1 w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                  />
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleReject(ticket.id)}
                      disabled={actionLoading[ticket.id]}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(ticket.id)}
                      disabled={actionLoading[ticket.id]}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-emerald-600/30 transition disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Correction</span>
                    </button>
                  </div>
                </div>
              )}

              {ticket.review_status !== 'PENDING' && ticket.review_notes && (
                <div className="text-[11px] text-slate-500 italic">
                  Decision note: "{ticket.review_notes}" (by {ticket.reviewer_name || 'Admin'})
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  )
}
