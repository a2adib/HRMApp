import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { markAttendance } from '../../api/attendance'

export default function ManagerDashboard() {
  const navigate = useNavigate()

  const handleMark = async () => {
    try {
      const res = await markAttendance()
      if (res.success) toast.success(res.message)
      else toast.error(res.message)
    } catch {
      toast.error('Failed to mark attendance')
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={handleMark} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Mark Attendance</h2>
          <p className="text-sm text-gray-500">Record today's attendance</p>
        </button>
        <button onClick={() => navigate('/manager/leave-request')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Request Leave</h2>
          <p className="text-sm text-gray-500">Submit a leave request</p>
        </button>
        <button onClick={() => navigate('/manager/attendance')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Attendance History</h2>
          <p className="text-sm text-gray-500">View your attendance records</p>
        </button>
        <button onClick={() => navigate('/manager/leave-approval')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Approve Leave</h2>
          <p className="text-sm text-gray-500">Review employee leave requests</p>
        </button>
        <button onClick={() => navigate('/manager/employees')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Assigned Employees</h2>
          <p className="text-sm text-gray-500">View your team</p>
        </button>
      </div>
    </Layout>
  )
}
