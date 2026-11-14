import React from 'react'
import { cn } from '../../lib/utils'

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all select-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]'

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-600/30 focus:ring-brand-500 border border-transparent',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400 border border-slate-200 dark:border-slate-700/80',
    outline: 'border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:ring-slate-400',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
    destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/30 focus:ring-rose-500 border border-transparent',
    subtleSuccess: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20',
  }

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs font-semibold px-3.5 py-2 gap-2',
    lg: 'text-sm font-semibold px-4 py-2.5 gap-2.5',
    icon: 'p-2',
  }

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon && iconPosition === 'left' && icon}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && icon}
    </button>
  )
})

Button.displayName = 'Button'
