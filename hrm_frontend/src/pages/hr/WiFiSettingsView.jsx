import React, { useState, useEffect } from 'react'
import { listAccessPoints, createAccessPoint, deleteAccessPoint, listWifiSessions } from '../../api/wifi'
import { listOffices } from '../../api/organizations'
import {
  Wifi,
  Plus,
  Trash2,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Radio,
  MapPin,
  Clock
} from 'lucide-react'

export default function WiFiSettingsView() {
  const [accessPoints, setAccessPoints] = useState([])
  const [sessions, setSessions] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('aps')

  const [form, setForm] = useState({
    name: '',
    office: '',
    mac_address: '',
    ip_address: '',
    location_description: '',
  })

  const loadData = () => {
    setLoading(true)
    Promise.all([listAccessPoints(), listWifiSessions(), listOffices()])
      .then(([apRes, sesRes, offRes]) => {
        setAccessPoints(apRes.results || apRes || [])
        setSessions(sesRes.results || sesRes || [])
        setOffices(offRes.results || offRes || [])
      })
      .catch((err) => {
        console.error('Failed to load Wi-Fi settings:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createAccessPoint(form)
      setIsModalOpen(false)
      setForm({ name: '', office: '', mac_address: '', ip_address: '', location_description: '' })
      loadData()
    } catch (err) {
      alert('Failed to register Access Point: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Access Point? Raw sessions from this MAC will be ignored.')) {
      try {
        await deleteAccessPoint(id)
        loadData()
      } catch (err) {
        alert('Failed to delete AP.')
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Wi-Fi Attendance & Access Points</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enterprise RADIUS 802.1X gateway integration, hardware BSSID registration, and live connection logs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Access Point</span>
          </button>
        </div>
      </div>

      {/* Gateway Telemetry Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Internal Ingestion API</span>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-xs font-semibold text-emerald-500">ACTIVE & READY</span>
          </div>
          <p className="font-mono text-[10px] text-slate-500 truncate">/api/v1/internal/wifi-events/</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered APs</span>
          <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400">
            {accessPoints.length} Hardware Units
          </div>
          <p className="text-[10px] text-slate-500">Authorized BSSID hardware mappings</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Flapping Suppression Buffer</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            5 Minutes
          </div>
          <p className="text-[10px] text-slate-500">Auto-merges device sleep disconnects</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('aps')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'aps'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Registered Access Points ({accessPoints.length})
          {activeTab === 'aps' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'sessions'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Live RADIUS Session Stream ({sessions.length})
          {activeTab === 'sessions' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400"></span>
          )}
        </button>
      </div>

      {/* Tab 1: Access Points */}
      {activeTab === 'aps' && (
        <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Hardware Unit</th>
                <th className="py-3 px-4">BSSID / MAC Address</th>
                <th className="py-3 px-4">Office Facility</th>
                <th className="py-3 px-4">Management IP</th>
                <th className="py-3 px-4">Landmark Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-sans">
                    Loading access point inventory...
                  </td>
                </tr>
              ) : accessPoints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-sans">
                    No access points registered yet.
                  </td>
                </tr>
              ) : (
                accessPoints.map((ap) => (
                  <tr key={ap.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-emerald-500" />
                      <span>{ap.name}</span>
                    </td>
                    <td className="py-3 px-4 text-brand-600 dark:text-brand-400 font-bold">
                      {ap.mac_address}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">
                      {ap.office_name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {ap.ip_address || 'DHCP'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">
                      {ap.location_description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleDelete(ap.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="Delete AP"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Live RADIUS Sessions */}
      {activeTab === 'sessions' && (
        <div className="rounded-2xl bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Matched Employee</th>
                <th className="py-3 px-4">RADIUS User-Name</th>
                <th className="py-3 px-4">Called-Station-Id (AP MAC)</th>
                <th className="py-3 px-4">Session Duration</th>
                <th className="py-3 px-4">Session End</th>
                <th className="py-3 px-4">Processing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-sans">
                    No raw Wi-Fi sessions recorded yet.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                      {s.employee_name || 'Unattributed Device'}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">
                      {s.raw_username}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {s.raw_mac_address}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                      {Math.round(s.duration_seconds / 60)} mins
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(s.session_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'PROCESSED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                        s.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add AP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Access Point</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">AP Identifier / Name</label>
                <input
                  type="text"
                  required
                  placeholder="HQ-Floor3-West-AP01"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Office Facility</label>
                <select
                  required
                  value={form.office}
                  onChange={(e) => setForm({ ...form, office: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="">Select Office</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">BSSID / MAC Address</label>
                <input
                  type="text"
                  required
                  placeholder="00:1A:1E:17:F1:80"
                  value={form.mac_address}
                  onChange={(e) => setForm({ ...form, mac_address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Management IP (Optional)</label>
                <input
                  type="text"
                  placeholder="10.0.1.10"
                  value={form.ip_address}
                  onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300">Physical Landmark Location</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 3, North Breakout Space"
                  value={form.location_description}
                  onChange={(e) => setForm({ ...form, location_description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Save Access Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
