import React from 'react'
import { cn } from '../../lib/utils'

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline', // 'underline' or 'pill'
  className,
}) {
  return (
    <div className={cn(
      variant === 'underline'
        ? 'flex space-x-6 border-b border-slate-200 dark:border-slate-800'
        : 'inline-flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-x-1',
      className
    )}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'text-xs font-medium transition-all select-none',
              variant === 'underline'
                ? cn(
                    'py-3 border-b-2 flex items-center gap-1.5',
                    isActive
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  )
                : cn(
                    'px-3 py-1.5 rounded-md flex items-center gap-1.5',
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )
            )}
          >
            {tab.icon && tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className={cn('w-full text-left text-xs text-slate-700 dark:text-slate-300', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('bg-slate-50 dark:bg-[#121826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800/80 font-normal', className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn('hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors', className)} {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }) {
  return (
    <th className={cn('py-3 px-4 font-semibold', className)} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('py-3 px-4', className)} {...props}>
      {children}
    </td>
  )
}

export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  action,
  className,
}) {
  return (
    <div className={cn('py-12 px-4 text-center flex flex-col items-center justify-center space-y-3', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  )
}
