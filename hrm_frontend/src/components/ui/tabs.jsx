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
                    'py-2.5 border-b-2 flex items-center gap-1.5',
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
