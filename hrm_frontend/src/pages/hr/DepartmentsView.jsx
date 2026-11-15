import React, { useState, useEffect } from 'react'
import { listDepartments, createDepartment, listDesignations, createDesignation } from '../../api/departments'
import {
  Building2,
  Users,
  Plus,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react'

export default function DepartmentsView() {
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isDesModalOpen, setIsDesModalOpen] = useState(false)

  const [deptForm, setDeptForm] = useState({ name: '', code: '' })
  const [desForm, setDesForm] = useState({ department: '', title: '', code: '', level: 1 })

  const loadData = () => {
    setLoading(true)
    Promise.all([listDepartments(), listDesignations()])
      .then(([deptRes, desRes]) => {
        setDepartments(deptRes.results || deptRes || [])
        setDesignations(desRes.results || desRes || [])
      })
      .catch((err) => {
        console.error('Failed to load departments:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateDept = async (e) => {
    e.preventDefault()
    try {
      await createDepartment(deptForm)
      setIsDeptModalOpen(false)
      setDeptForm({ name: '', code: '' })
      loadData()
    } catch (err) {
      alert('Failed to create department: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleCreateDes = async (e) => {
    e.preventDefault()
    try {
      await createDesignation(desForm)
      setIsDesModalOpen(false)
      setDesForm({ department: '', title: '', code: '', level: 1 })
      loadData()
    } catch (err) {
      alert('Failed to create designation: ' + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Organization Hierarchy & Departments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structure operational units, job seniority levels, and department leadership
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDesModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Designation</span>
          </button>
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2"></div>
            Loading organizational tree...
          </div>
        ) : (
          departments.map((dept) => {
            const deptDesignations = designations.filter((d) => d.department === dept.id || d.department_name === dept.name)
            return (
              <div
                key={dept.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</h2>
                        <span className="font-mono text-[10px] text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {dept.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span>Department Lead:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{dept.head_name || 'Executive Chair'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff Headcount:</span>
                      <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{dept.employee_count ?? 0} members</span>
                    </div>
                  </div>

                  {/* Designations list */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Active Roles ({deptDesignations.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {deptDesignations.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No roles created</span>
                      ) : (
                        deptDesignations.map((des) => (
                          <span
                            key={des.id}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <span>{des.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">L{des.level}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Department</h2>
            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="QA"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono uppercase"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Designation Modal */}
      {isDesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Designation / Role</h2>
            <form onSubmit={handleCreateDes} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Target Department</label>
                <select
                  required
                  value={desForm.department}
                  onChange={(e) => setDesForm({ ...desForm, department: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Automation Engineer"
                  value={desForm.title}
                  onChange={(e) => setDesForm({ ...desForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Role Code</label>
                <input
                  type="text"
                  required
                  placeholder="LEAD-QA"
                  value={desForm.code}
                  onChange={(e) => setDesForm({ ...desForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Seniority Grade Level (1 - 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={desForm.level}
                  onChange={(e) => setDesForm({ ...desForm, level: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDesModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
