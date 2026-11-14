import React from 'react'
import { cn } from '../../lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1422] text-slate-900 dark:text-slate-100 shadow-card transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold tracking-tight text-slate-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500 dark:text-slate-400', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function StatisticCard({
  label,
  value,
  trend,
  trendType = 'positive', // 'positive', 'negative', 'neutral'
  comparison,
  footnote,
  icon: Icon,
  accentColor = 'brand', // 'brand', 'emerald', 'amber', 'rose', 'purple'
  className,
}) {
  const accentBorders = {
    brand: 'bg-brand-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
  }

  const dotColors = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className={cn('p-4 rounded-xl bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between', className)}>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className={cn('w-2 h-2 rounded-full', dotColors[accentColor])}></span>
            {label}
          </span>
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        </div>
        
        <div className="flex items-baseline space-x-2 mt-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
          {trend && (
            <span className={cn(
              'text-xs font-mono font-medium flex items-center',
              trendType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
              trendType === 'negative' ? 'text-rose-600 dark:text-rose-400' :
              'text-slate-500 dark:text-slate-400'
            )}>
              {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
        </div>
      </div>

      {(comparison || footnote) && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono">
          <span>{comparison}</span>
          <span>{footnote}</span>
        </div>
      )}

      <div className={cn('absolute bottom-0 left-0 right-0 h-0.5 opacity-90', accentBorders[accentColor])}></div>
    </div>
  )
}
