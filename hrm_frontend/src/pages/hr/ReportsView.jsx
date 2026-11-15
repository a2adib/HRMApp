import React, { useState, useEffect } from 'react'
import { getAttendanceReport, getLeaveReport, getPayrollSummary } from '../../api/reports'
import { listDepartments } from '../../api/departments'
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  Users,
  Clock,
  CalendarRange,
  DollarSign
} from 'lucide-react'

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState('attendance')
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listDepartments().then((res) => setDepartments(res.results || res || []))
  }, [])

  const loadReport = () => {
    setLoading(true)
    if (activeTab === 'attendance') {
      getAttendanceReport({ from_date: fromDate, to_date: toDate, department_id: selectedDept })
        .then((res) => setData(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false))
    } else if (activeTab === 'leaves') {
      getLeaveReport({ year: new Date().getFullYear(), department_id: selectedDept })
        .then((res) => setData(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      getPayrollSummary({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
        .then((res) => setData(res.summary || []))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    loadReport()
  }, [activeTab, fromDate, toDate, selectedDept])

  const exportCSV = () => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map((obj) => headers.map((header) => `"${obj[header] ?? ''}"`).join(','))
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Payroll Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export official attendance timesheets, leave utilization metrics, and payroll work hours
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!data.length}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'attendance'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Attendance Timesheets
          {activeTab === 'attendance' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'leaves'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Leave Utilization Report
          {activeTab === 'leaves' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'payroll'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Payroll Work Hours Summary
          {activeTab === 'payroll' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          {activeTab === 'attendance' && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-800 dark:text-white"
                />
              </div>
            </>
          )}

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <span className="font-mono text-slate-500">
          {data.length} records generated
        </span>
      </div>

      {/* Report Data Preview Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((col) => (
                    <th key={col} className="py-2.5 px-4 capitalize font-semibold">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-sans">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
                    Generating analytics report...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-sans">
                    No data records matching criteria.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 text-slate-700 dark:text-slate-300 truncate max-w-xs">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
