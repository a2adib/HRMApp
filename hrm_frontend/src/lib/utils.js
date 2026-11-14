import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTime(timeStr) {
  if (!timeStr) return '—'
  // Handle ISO or HH:MM:SS
  if (timeStr.includes('T')) {
    const d = new Date(timeStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const hour = parseInt(parts[0], 10)
    const minute = parts[1]
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour.toString().padStart(2, '0')}:${minute} ${ampm}`
  }
  return timeStr
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '0h 00m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}
