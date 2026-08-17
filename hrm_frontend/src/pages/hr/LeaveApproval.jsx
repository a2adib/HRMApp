import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import LeaveCard from '../../components/LeaveCard'
import { getAllLeaves, updateLeaveStatus } from '../../api/leave'

export default function HRLeaveApproval() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    getAllLeaves()
      .then((data) => setRequests(data.requests))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const handleAction = async (id, status) => {
    try {
      await updateLeaveStatus(id, status)
      toast.success(`Leave ${status.toLowerCase()}`)
      fetch()
    } catch {
      toast.error('Failed to update leave status')
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">All Leave Requests</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No leave requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <LeaveCard key={req.id} request={req} onAction={handleAction} />
          ))}
        </div>
      )}
    </Layout>
  )
}
