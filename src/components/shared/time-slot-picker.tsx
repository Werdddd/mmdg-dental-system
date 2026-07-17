'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDisplayTime } from '@/lib/utils'

const SLOT_INTERVAL_MINUTES = 30
const DAY_START_HOUR = 7 // 7:00 AM
const DAY_END_HOUR = 20 // 8:00 PM

export function generateTimeSlots(
  startHour = DAY_START_HOUR,
  endHour = DAY_END_HOUR,
  intervalMinutes = SLOT_INTERVAL_MINUTES,
): string[] {
  const slots: string[] = []
  for (
    let minutes = startHour * 60;
    minutes <= endHour * 60;
    minutes += intervalMinutes
  ) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
    const mm = String(minutes % 60).padStart(2, '0')
    slots.push(`${hh}:${mm}`)
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

interface TimeSlotPickerProps {
  value: string
  onValueChange: (time: string) => void
  label?: string
  className?: string
  triggerClassName?: string
}

export function TimeSlotPicker({
  value,
  onValueChange,
  label,
  className,
  triggerClassName,
}: TimeSlotPickerProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium">{label}</label>
      )}
      <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
        <SelectTrigger className={triggerClassName ?? 'w-full'}>
          <SelectValue>
            {(time: string) =>
              time ? formatDisplayTime(time) : 'Select a time'
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-64 overflow-y-auto">
          {TIME_SLOTS.map((slot) => (
            <SelectItem key={slot} value={slot}>
              {formatDisplayTime(slot)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
