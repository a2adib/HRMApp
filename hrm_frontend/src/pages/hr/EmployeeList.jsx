import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listEmployees, createEmployee, deleteEmployee } from '../../api/employees'
import { listDepartments, listDesignations } from '../../api/departments'
import { listOffices } from '../../api/organizations'
import { listShifts } from '../../api/shifts'
import { Avatar } from '../../components/ui/avatar'
import { StatusBadge } from '../../components/ui/status-badge'
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  MapPin,
  Wifi
} from 'lucide-react'

export default function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [offices, setOffices] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    work_email: '',
    employee_code: '',
    phone_number: '',
    department: '',
    designation: '',
    office: '',
    network_username: '',
    role: 'EMPLOYEE',
    password: 'Password123!',
    joining_date: new Date().toISOString().split('T')[0],
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const loadData = () => {
    setLoading(true)
    Promise.all([
      listEmployees({ search, department: selectedDept, employment_status: selectedStatus }),
      listDepartments(),
      listDesignations(),
      listOffices(),
      listShifts(),
    ])
      .then(([empRes, deptRes, desRes, offRes, shiftRes]) => {
        setEmployees(empRes.results || empRes || [])
        setDepartments(deptRes.results || deptRes || [])
        setDesignations(desRes.results || desRes || [])
        setOffices(offRes.results || offRes || [])
        setShifts(shiftRes.results || shiftRes || [])
      })
      .catch((err) => {
        console.error('Failed to load employees:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [search, selectedDept, selectedStatus])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      await createEmployee(formData)
      setIsModalOpen(false)
      setFormData({
        first_name: '',
        last_name: '',
        work_email: '',
        employee_code: '',
        phone_number: '',
        department: '',
        designation: '',
        office: '',
        network_username: '',
        role: 'EMPLOYEE',
        password: 'Password123!',
        joining_date: new Date().toISOString().split('T')[0],
      })
      loadData()
    } catch (err) {
      setFormError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to onboard employee.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await deleteEmployee(id)
        loadData()
      } catch (err) {
        alert('Failed to delete employee: ' + (err.response?.data?.detail || err.message))
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Onboard Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage organization staff, departments, enterprise Wi-Fi usernames, and employment status
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Employee</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employee code, email, or Wi-Fi username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Office Location</th>
                <th className="py-3 px-4">Wi-Fi Identity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
                    Loading staff directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar name={`${emp.first_name} ${emp.last_name}`} src={emp.avatar_url} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp.work_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 font-medium">
                      {emp.employee_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{emp.department_name || '—'}</div>
                      <div className="text-[11px] text-slate-400">{emp.designation_title || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 flex items-center space-x-1.5 pt-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.office_name || 'Main Office'}</span>
                    </td>
                    <td className="py-3 px-4">
                      {emp.network_username ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Wifi className="w-3 h-3 text-emerald-500" />
                          <span>{emp.network_username}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        emp.employment_status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {emp.employment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/hr/employees/${emp.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Employee Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Onboard New Employee</h2>
                <p className="text-xs text-slate-400">Creates profile, system credentials, and initializes leave quota</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.work_email}
                    onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Employee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-105"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department *</label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Designation *</label>
                  <select
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select Designation</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.title} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Office Location *</label>
                  <select
                    required
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select Office</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Wi-Fi Identity (RADIUS User-Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. jdoe (802.1X login)"
                    value={formData.network_username}
                    onChange={(e) => setFormData({ ...formData, network_username: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Access Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR_ADMIN">HR Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Default Password</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Employee Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
