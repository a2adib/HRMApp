import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { getAllAttendance } from '../../api/attendance'

export default function AllAttendance() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllAttendance()
      .then((data) => setLogs(data.logs))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? logs : logs.filter((l) => l.role === filter.toLowerCase())

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">All Attendance</h1>
      <div className="mb-4 flex gap-2">
        {['All', 'Employee', 'Manager'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded transition ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No attendance records found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2">{log.username}</td>
                  <td className="px-4 py-2 capitalize">{log.role}</td>
                  <td className="px-4 py-2">{log.date}</td>
                  <td className="px-4 py-2">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
