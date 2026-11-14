import React from 'react'
import { cn } from '../../lib/utils'

export const Input = React.forwardRef(({
  className,
  type = 'text',
  icon: Icon,
  shortcut,
  error,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed',
          Icon ? 'pl-9' : 'pl-3',
          shortcut ? 'pr-12' : 'pr-3',
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : '',
          className
        )}
        {...props}
      />
      {shortcut && (
        <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <kbd className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {shortcut}
          </kbd>
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export const Select = React.forwardRef(({
  className,
  children,
  error,
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition disabled:opacity-50 cursor-pointer',
        error ? 'border-rose-500' : '',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})

Select.displayName = 'Select'
