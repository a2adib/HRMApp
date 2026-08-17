import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { markAttendance } from '../../api/attendance'

export default function HRDashboard() {
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
      <h1 className="text-2xl font-bold mb-6">HR Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={handleMark} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Mark Attendance</h2>
          <p className="text-sm text-gray-500">Record today's attendance</p>
        </button>
        <button onClick={() => navigate('/hr/add-user')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Add New User</h2>
          <p className="text-sm text-gray-500">Create employee or manager account</p>
        </button>
        <button onClick={() => navigate('/hr/attendance')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">All Attendance</h2>
          <p className="text-sm text-gray-500">View all attendance records</p>
        </button>
        <button onClick={() => navigate('/hr/leave-approval')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Approve Leave</h2>
          <p className="text-sm text-gray-500">Review all leave requests</p>
        </button>
        <button onClick={() => navigate('/hr/users')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">User List</h2>
          <p className="text-sm text-gray-500">View all users and attendance counts</p>
        </button>
        <button onClick={() => navigate('/hr/export')} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition text-left">
          <h2 className="font-semibold text-lg">Export Attendance</h2>
          <p className="text-sm text-gray-500">Download attendance as CSV</p>
        </button>
      </div>
    </Layout>
  )
}
