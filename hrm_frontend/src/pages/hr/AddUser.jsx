import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { addUser, getUsers } from '../../api/users'

export default function AddUser() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [manager, setManager] = useState('')
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUsers().then((data) => {
      setManagers(data.users.filter((u) => u.role === 'manager'))
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addUser({ username, password, role, manager: role === 'employee' ? manager : null })
      toast.success('User added successfully')
      setUsername('')
      setPassword('')
      setRole('employee')
      setManager('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Add New User</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        {role === 'employee' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Manager</label>
            <select value={manager} onChange={(e) => setManager(e.target.value)} className="w-full px-3 py-2 border rounded" required>
              <option value="">Select a manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.username}>{m.username}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition">
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </Layout>
  )
}
