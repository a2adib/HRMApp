import React, { useState, useEffect } from 'react'
import { listLeaveRequests, approveLeave, rejectLeave, listLeaveTypes, createLeaveType } from '../../api/leaves'
import { Avatar } from '../../components/ui/avatar'
import {
  CalendarRange,
  CheckCircle2,
  XCircle,
  Plus,
  Filter,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

export default function LeaveManagement() {
  const [requests, setRequests] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [reviewNotes, setReviewNotes] = useState({})
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [newType, setNewType] = useState({ name: '', code: '', default_quota_days: 15, is_paid: true })

  const loadData = () => {
    setLoading(true)
    Promise.all([
      listLeaveRequests(statusFilter ? { status: statusFilter } : {}),
      listLeaveTypes(),
    ])
      .then(([reqRes, typeRes]) => {
        setRequests(reqRes.results || reqRes || [])
        setLeaveTypes(typeRes.results || typeRes || [])
      })
      .catch((err) => {
        console.error('Failed to load leaves:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleApprove = async (id) => {
    try {
      await approveLeave(id, { review_notes: reviewNotes[id] || 'Approved by HR Administrator.' })
      loadData()
    } catch (err) {
      alert('Approval error: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleReject = async (id) => {
    try {
      await rejectLeave(id, { review_notes: reviewNotes[id] || 'Rejected due to staffing constraints.' })
      loadData()
    } catch (err) {
      alert('Rejection error: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleCreateType = async (e) => {
    e.preventDefault()
    try {
      await createLeaveType(newType)
      setIsTypeModalOpen(false)
      setNewType({ name: '', code: '', default_quota_days: 15, is_paid: true })
      loadData()
    } catch (err) {
      alert('Failed to create leave policy: ' + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Leave Governance & Approvals</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adjudicate employee time-off applications, manage annual quotas, and review departmental leaves
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTypeModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configure Policy</span>
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Applications</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Types Policy Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {leaveTypes.map((lt) => (
          <div key={lt.id} className="p-3.5 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">{lt.name}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1 rounded">
                {lt.code}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Default Quota: {lt.default_quota_days} days/yr ({lt.is_paid ? 'Paid' : 'Unpaid'})
            </div>
          </div>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Leave Policy</th>
                <th className="py-3 px-4">Date Interval</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Justification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Decision Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
                    Loading leave applications...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No leave requests found matching selected filter.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <Avatar name={req.employee_name || 'Staff'} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{req.employee_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{req.department_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {req.leave_type_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {req.start_date} <span className="text-slate-400">to</span> {req.end_date}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-100">
                      {req.total_days} days
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        req.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                        req.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                        'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Reject Application"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-1 shadow-sm"
                            title="Approve Leave"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {req.status} {req.reviewed_at ? `on ${new Date(req.reviewed_at).toLocaleDateString()}` : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Policy Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Leave Policy</h2>
            <form onSubmit={handleCreateType} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Policy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parental Leave"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Policy Code</label>
                <input
                  type="text"
                  required
                  placeholder="PARENTAL"
                  value={newType.code}
                  onChange={(e) => setNewType({ ...newType, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Default Annual Quota (Days)</label>
                <input
                  type="number"
                  required
                  value={newType.default_quota_days}
                  onChange={(e) => setNewType({ ...newType, default_quota_days: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_paid"
                  checked={newType.is_paid}
                  onChange={(e) => setNewType({ ...newType, is_paid: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <label htmlFor="is_paid" className="text-slate-700 dark:text-slate-300">Paid Leave Category</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
