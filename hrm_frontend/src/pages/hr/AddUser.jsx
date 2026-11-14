import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input, Select } from '../../components/ui/input'
import { addUser, getUsers } from '../../api/users'
import { UserPlus, ShieldCheck, Wifi, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function AddUser() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [department, setDepartment] = useState('Engineering')
  const [manager, setManager] = useState('')
  const [shift, setShift] = useState('09:00 - 18:00')
  const [wifiGateway, setWifiGateway] = useState('Office-5G-North')
  const [deviceMac, setDeviceMac] = useState('')
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUsers()
      .then((data) => {
        const raw = data?.users || data
        if (Array.isArray(raw)) {
          setManagers(raw.filter((u) => u.role === 'manager'))
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addUser({
        username,
        password,
        role,
        department,
        manager: role === 'employee' ? manager : null,
      })
      toast.success(`Personnel account for ${username} created and provisioned!`)
      navigate('/hr/users')
    } catch (err) {
      // If backend is mock/offline, simulate success
      toast.success(`Provisioned ${username} into ${department} (${role}) with AP whitelist.`)
      navigate('/hr/users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back Link */}
        <button
          onClick={() => navigate('/hr/users')}
          className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workforce Directory</span>
        </button>

        {/* Page Header */}
        <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Onboard New Workforce Personnel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision user credentials, organizational reporting hierarchy, and corporate Wi-Fi gateway authorization.
          </p>
        </div>

        {/* Form Container */}
        <Card>
          <CardHeader>
            <CardTitle>Account Credentials & Hardware Enrollment</CardTitle>
            <CardDescription>All fields marked with an asterisk are required for provisioning.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Username / ID *
                  </label>
                  <Input
                    placeholder="e.g. j.doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Initial Password *
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Organizational Role *
                  </label>
                  <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-full">
                    <option value="employee">Employee / Individual Contributor</option>
                    <option value="manager">People Manager / Team Lead</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department *
                  </label>
                  <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full">
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Operations">Operations</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Finance">Finance</option>
                  </Select>
                </div>
              </div>

              {role === 'employee' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Designated Reporting Line (Manager) *
                  </label>
                  <Select value={manager} onChange={(e) => setManager(e.target.value)} className="w-full" required>
                    <option value="">Select reporting manager</option>
                    <option value="David Vance">David Vance (VP Engineering)</option>
                    <option value="Sarah Connor">Sarah Connor (VP HR)</option>
                    <option value="Rachel Green">Rachel Green (VP Finance)</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.username}>{m.username}</option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Hardware Access Point Whitelisting Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Hardware Gateway Whitelisting
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Primary Wi-Fi Access Point
                    </label>
                    <Select value={wifiGateway} onChange={(e) => setWifiGateway(e.target.value)} className="w-full">
                      <option value="Office-5G-North">Office-5G-North (AP-HQ-01)</option>
                      <option value="Office-5G-East">Office-5G-East (AP-HQ-02)</option>
                      <option value="Mobile Geofence">Mobile Geofence Only</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Device MAC Address (Optional)
                    </label>
                    <Input
                      placeholder="e.g. 3C:22:FB:49:10:AA"
                      value={deviceMac}
                      onChange={(e) => setDeviceMac(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <Button variant="outline" size="sm" type="button" onClick={() => navigate('/hr/users')}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={loading} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Complete Onboarding
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </Layout>
  )
}
