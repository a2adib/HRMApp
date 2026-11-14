import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none'

  const variants = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  }

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.2 font-mono',
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  )
}
