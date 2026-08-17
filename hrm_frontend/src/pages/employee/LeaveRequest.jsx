import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { createLeave } from '../../api/leave'

export default function EmployeeLeaveRequest() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createLeave({ from_date: fromDate, to_date: toDate, reason })
      toast.success('Leave request submitted')
      navigate('/employee/dashboard')
    } catch {
      toast.error('Failed to submit leave request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Leave Request</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} required />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </Layout>
  )
}
