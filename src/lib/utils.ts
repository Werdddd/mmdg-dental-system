import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount)
}

// All mock data across the app treats this as "today" for consistency.
export const MOCK_TODAY = 'Jun 21, 2026'

function dateFromIso(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDisplayDate(isoDate: string) {
  return dateFromIso(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonthDay(isoDate: string) {
  return dateFromIso(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDisplayTime(time24: string) {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

export function initialsOf(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
