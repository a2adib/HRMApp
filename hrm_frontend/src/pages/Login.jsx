import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('sarah.jenkins@acme-corp.com')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      const role = data.user?.role?.toLowerCase() || 'hr'

      if (role.includes('admin') || role.includes('hr')) {
        navigate('/hr/dashboard')
      } else if (role.includes('manager')) {
        navigate('/manager/dashboard')
      } else {
        navigate('/employee/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const selectDemoRole = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 font-sans relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-600/10 border border-brand-500/20 text-brand-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Acme Global HR</h1>
          <p className="text-xs text-slate-400">Enterprise Workforce & Wi-Fi Attendance Platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Work Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@acme-corp.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <a href="#forgot" className="text-[11px] text-brand-400 hover:text-brand-300">Forgot?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Demo Fast-Login Selector */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block text-center">
            One-Click Seed Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => selectDemoRole('sarah.jenkins@acme-corp.com', 'Password123!')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/50 text-left transition flex flex-col"
            >
              <span className="font-semibold text-white">HR Admin</span>
              <span className="text-[10px] text-slate-400 truncate">sarah.jenkins</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('marcus.brody@acme-corp.com', 'Password123!')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/50 text-left transition flex flex-col"
            >
              <span className="font-semibold text-white">Manager</span>
              <span className="text-[10px] text-slate-400 truncate">marcus.brody</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('alex.rivera@acme-corp.com', 'Password123!')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/50 text-left transition flex flex-col"
            >
              <span className="font-semibold text-white">Employee</span>
              <span className="text-[10px] text-slate-400 truncate">alex.rivera</span>
            </button>
            <button
              type="button"
              onClick={() => selectDemoRole('admin@acme-corp.com', 'Admin123!')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/50 text-left transition flex flex-col"
            >
              <span className="font-semibold text-white">Super Admin</span>
              <span className="text-[10px] text-slate-400 truncate">admin@acme</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
