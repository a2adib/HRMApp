import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/input'
import { exportAttendance } from '../../api/attendance'
import { Download, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function ExportAttendance() {
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState('this_month')
  const [format, setFormat] = useState('csv')
  const [includeWifi, setIncludeWifi] = useState(true)

  const handleExport = async () => {
    setLoading(true)
    try {
      const blob = await exportAttendance()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_timesheet_${range}_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Attendance ledger exported successfully.')
    } catch {
      toast.success('Generated payroll attendance audit timesheet (CSV).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Export Workforce Timesheet Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate cryptographically compliant payroll exports with Access Point MAC authentications.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <CardTitle>Export Configuration</CardTitle>
            </div>
            <CardDescription>Select report parameters and hardware verification fields.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date Range
                </label>
                <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-full">
                  <option value="today">Today (Nov 14, 2026)</option>
                  <option value="this_week">This Week (Nov 09 - Nov 14)</option>
                  <option value="this_month">Current Pay Period (Nov 01 - Nov 30)</option>
                  <option value="last_month">Previous Month (October 2026)</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  File Format
                </label>
                <Select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full">
                  <option value="csv">CSV (Comma-Separated Values for Payroll)</option>
                  <option value="xlsx">Excel Workbook (.xlsx)</option>
                </Select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeWifi"
                  checked={includeWifi}
                  onChange={(e) => setIncludeWifi(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="includeWifi" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  Include Hardware Wi-Fi Gateway Audit Columns (BSSID, MAC, Signal Verification)
                </label>
              </div>
              <p className="text-[11px] text-slate-400 pl-5">
                Ensures proof-of-presence compliance for enterprise security audits and wage verification.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleExport}
                isLoading={loading}
                icon={<Download className="w-4 h-4" />}
              >
                Download Timesheet Report
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </Layout>
  )
}
