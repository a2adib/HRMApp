import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { getUsers } from '../../api/users'
import { getAllAttendance } from '../../api/attendance'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getUsers(), getAllAttendance()])
      .then(([userData, attData]) => {
        setUsers(userData.users)
        const map = {}
        attData.logs.forEach((log) => {
          map[log.username] = (map[log.username] || 0) + 1
        })
        setAttendanceMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">User List</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Attendance Days</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-2">{attendanceMap[u.username] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
