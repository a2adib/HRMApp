import React, { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className={cn(
          'relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-slate-800 text-left shadow-2xl transition-all w-full my-8 z-10',
          maxWidth,
          className
        )}>
          {(title || description) && (
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                {title && <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>}
                {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-6 text-xs text-slate-700 dark:text-slate-300">
            {children}
          </div>

          {footer && (
            <div className="p-4 px-6 bg-slate-50 dark:bg-[#121828] border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-xl',
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={cn(
          'w-screen bg-white dark:bg-[#0F1422] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col',
          maxWidth,
          className
        )}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#121828]">
            <div>
              {title && <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 dark:text-slate-300">
            {children}
          </div>

          {footer && (
            <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121828] flex items-center justify-between">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
