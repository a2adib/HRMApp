import { useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { exportAttendance } from '../../api/attendance'

export default function ExportAttendance() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const blob = await exportAttendance()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Attendance exported')
    } catch {
      toast.error('Failed to export attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Export Attendance</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-md">
        <p className="text-gray-600 mb-4">Download all attendance records as a CSV file.</p>
        <button
          onClick={handleExport}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
        >
          {loading ? 'Exporting...' : 'Download CSV'}
        </button>
      </div>
    </Layout>
  )
}
