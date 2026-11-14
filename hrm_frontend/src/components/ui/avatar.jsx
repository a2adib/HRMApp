import React from 'react'
import { cn } from '../../lib/utils'

export function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status, // 'online', 'offline', 'away', 'leave'
  className,
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base font-semibold',
  }

  const statusDots = {
    online: 'bg-emerald-500 ring-white dark:ring-[#0F1422]',
    away: 'bg-amber-500 ring-white dark:ring-[#0F1422]',
    leave: 'bg-purple-500 ring-white dark:ring-[#0F1422]',
    offline: 'bg-slate-400 ring-white dark:ring-[#0F1422]',
  }

  const getInitials = (n) => {
    if (!n) return '?'
    const parts = n.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn('rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700', sizes[size])}
        />
      ) : (
        <div className={cn('rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center font-medium font-mono', sizes[size])}>
          {getInitials(name || alt)}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2',
            statusDots[status] || statusDots.offline
          )}
        />
      )}
    </div>
  )
}
