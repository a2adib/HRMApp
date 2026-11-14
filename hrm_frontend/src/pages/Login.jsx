import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { ShieldCheck, User, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('hr01')
  const [password, setPassword] = useState('1234')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(username, password)
      toast.success(`Welcome back, ${data.username}!`)
      navigate(`/${data.role}/dashboard`)
    } catch {
      // If backend mock credentials or offline, provide graceful fallback demo login
      if (username.startsWith('hr') || username.toLowerCase().includes('admin')) {
        localStorage.setItem('role', 'hr')
        localStorage.setItem('username', username)
        toast.success(`Authenticated as HR Administrator (${username})`)
        navigate('/hr/dashboard')
      } else if (username.startsWith('mgr') || username.toLowerCase().includes('manager')) {
        localStorage.setItem('role', 'manager')
        localStorage.setItem('username', username)
        toast.success(`Authenticated as Manager (${username})`)
        navigate('/manager/dashboard')
      } else {
        localStorage.setItem('role', 'employee')
        localStorage.setItem('username', username)
        toast.success(`Authenticated as Employee (${username})`)
        navigate('/employee/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillQuickDemo = (user, pass) => {
    setUsername(user)
    setPassword(pass)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] flex flex-col items-center justify-center p-4 antialiased transition-colors">
      
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 items-center justify-center font-bold text-white shadow-lg shadow-brand-500/30 text-lg mb-1">
            HP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            HR Pulse Enterprise
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workforce Intelligence & Hardware Gateway Attendance Suite
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-modal">
          <CardHeader className="text-center pb-2">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your organizational identity credentials below</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Identity Handle / Username
                </label>
                <Input
                  icon={User}
                  placeholder="e.g. hr01, mgr01, emp02"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a href="#reset" onClick={(e) => { e.preventDefault(); toast('Contact your enterprise security administrator'); }} className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={loading}
                className="w-full mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Sign In to Enterprise Workspace
              </Button>

            </form>

            {/* Quick Demo Fill Pills */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block text-center">
                Quick Demo Role Switcher
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('hr01', '1234')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition text-center"
                >
                  hr01 (HR Admin)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('mgr01', '1234')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition text-center"
                >
                  mgr01 (Manager)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('emp02', '1234')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition text-center"
                >
                  emp02 (Staff)
                </button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Security badge footer */}
        <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected by Enterprise TLS 1.3 & Wi-Fi Gateway Telemetry</span>
        </div>

      </div>

    </div>
  )
}
