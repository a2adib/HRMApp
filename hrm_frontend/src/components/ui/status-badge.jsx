import React from 'react'
import { Badge } from './badge'
import { CheckCircle2, Clock, AlertCircle, Calendar, ShieldCheck, Wifi, XCircle } from 'lucide-react'

export function StatusBadge({ status, className }) {
  const s = (status || '').toLowerCase()

  if (s === 'active') {
    return (
      <Badge variant="success" className={className}>
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Active</span>
      </Badge>
    )
  }

  if (s === 'inactive') {
    return (
      <Badge variant="neutral" className={className}>
        <AlertCircle className="w-3 h-3 text-slate-400" />
        <span>Inactive</span>
      </Badge>
    )
  }

  if (['present', 'late', 'absent', 'half_day', 'half day', 'on_leave', 'leave', 'on leave'].includes(s)) {
    return <AttendanceStatusBadge status={status} className={className} />
  }

  if (['approved', 'pending', 'rejected', 'cancelled'].includes(s)) {
    return <LeaveStatusBadge status={status} className={className} />
  }

  return (
    <Badge variant="neutral" className={className}>
      <span>{status || 'Unknown'}</span>
    </Badge>
  )
}

export function AttendanceStatusBadge({ status, lateMinutes, className }) {
  const s = (status || '').toLowerCase()

  if (s === 'present') {
    return (
      <Badge variant="success" className={className}>
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Present</span>
      </Badge>
    )
  }

  if (s === 'late') {
    return (
      <Badge variant="warning" className={className}>
        <Clock className="w-3 h-3 text-amber-500" />
        <span>Late {lateMinutes ? `(+${lateMinutes}m)` : ''}</span>
      </Badge>
    )
  }

  if (s === 'absent') {
    return (
      <Badge variant="danger" className={className}>
        <AlertCircle className="w-3 h-3 text-rose-500" />
        <span>Absent</span>
      </Badge>
    )
  }

  if (s === 'half_day' || s === 'half day') {
    return (
      <Badge variant="info" className={className}>
        <Clock className="w-3 h-3 text-sky-500" />
        <span>Half Day</span>
      </Badge>
    )
  }

  if (s === 'on_leave' || s === 'leave' || s === 'on leave') {
    return (
      <Badge variant="purple" className={className}>
        <Calendar className="w-3 h-3 text-purple-500" />
        <span>On Leave</span>
      </Badge>
    )
  }

  return (
    <Badge variant="neutral" className={className}>
      <Clock className="w-3 h-3 text-slate-400" />
      <span>{status || 'Pending'}</span>
    </Badge>
  )
}

export function LeaveStatusBadge({ status, className }) {
  const s = (status || '').toLowerCase()

  if (s === 'approved') {
    return (
      <Badge variant="success" className={className}>
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Approved</span>
      </Badge>
    )
  }

  if (s === 'pending') {
    return (
      <Badge variant="warning" className={className}>
        <Clock className="w-3 h-3 text-amber-500" />
        <span>Pending Review</span>
      </Badge>
    )
  }

  if (s === 'rejected') {
    return (
      <Badge variant="danger" className={className}>
        <XCircle className="w-3 h-3 text-rose-500" />
        <span>Rejected</span>
      </Badge>
    )
  }

  if (s === 'cancelled') {
    return (
      <Badge variant="neutral" className={className}>
        <XCircle className="w-3 h-3 text-slate-400" />
        <span>Cancelled</span>
      </Badge>
    )
  }

  return (
    <Badge variant="neutral" className={className}>
      <span>{status || 'Draft'}</span>
    </Badge>
  )
}

export function WifiBadge({ apName = 'Office-5G-North', isVerified = true, isGeofence = false, className }) {
  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono ${className || ''}`}>
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>{apName}</span>
      </span>
    )
  }

  if (isGeofence) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-mono ${className || ''}`}>
        <Wifi className="w-3 h-3 text-blue-500" />
        <span>Mobile Geofence</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-mono ${className || ''}`}>
      <AlertCircle className="w-3 h-3 text-amber-500" />
      <span>Unverified Remote</span>
    </span>
  )
}
