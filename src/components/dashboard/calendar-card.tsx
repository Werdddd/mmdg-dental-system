'use client'

import { useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AddAppointmentDialog } from '@/components/appointments/add-appointment-dialog'
import { AppointmentDetailsDialog } from '@/components/appointments/appointment-details-dialog'
import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'
import type { PatientRow } from '@/components/patients/data'
import type { DentistOption } from '@/lib/data/dentists'

// ── helpers ───────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const STATUS_DOT: Record<AppointmentStatus, string> = {
  Confirmed: 'bg-blue-500',
  Completed: 'bg-emerald-500',
  Ongoing: 'bg-amber-500',
  Cancelled: 'bg-destructive',
  Rescheduled: 'bg-orange-400',
}

function buildGrid(year: number, month: number): (number | null)[][] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatHeading(isoDate: string) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

// ── component ─────────────────────────────────────────────────────────────────

interface CalendarCardProps {
  appointments: AppointmentRow[]
  patients: PatientRow[]
  dentists: DentistOption[]
  onAppointmentAdded?: (appt: AppointmentRow) => void
}

export function CalendarCard({
  appointments: initialAppointments,
  patients,
  dentists,
  onAppointmentAdded,
}: CalendarCardProps) {
  const now = new Date()
  const todayIso = now.toISOString().slice(0, 10)

  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(todayIso)
  const [addOpen, setAddOpen] = useState(false)
  const [detailsAppt, setDetailsAppt] = useState<AppointmentRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Local appointments — updated optimistically when a new one is added
  const [appointments, setAppointments] = useState(initialAppointments)

  const grid = useMemo(
    () => buildGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  // Days in the viewed month that have at least one appointment
  const markedDays = useMemo(() => {
    const set = new Set<number>()
    appointments.forEach((a) => {
      const d = new Date(a.scheduledAt)
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        set.add(d.getDate())
      }
    })
    return set
  }, [appointments, viewYear, viewMonth])

  // Appointments on the selected date, sorted by time
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.scheduledAt.slice(0, 10) === selectedDate)
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [appointments, selectedDate],
  )

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function handleDayClick(day: number) {
    setSelectedDate(toIsoDate(viewYear, viewMonth, day))
  }

  function handleAppointmentAdded(appt: AppointmentRow) {
    setAppointments((prev) => [appt, ...prev])
    setAddOpen(false)
    onAppointmentAdded?.(appt)
  }

  function handleApptClick(appt: AppointmentRow) {
    setDetailsAppt(appt)
    setDetailsOpen(true)
  }

  function handleStatusChanged(updated: AppointmentRow) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    )
    setDetailsAppt(updated)
  }

  return (
    <div className="flex h-[32rem] flex-col rounded-xl border bg-card p-5 shadow-sm">
      {/* Month nav */}
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-base font-semibold">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={prevMonth}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={nextMonth}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <table className="mt-3 w-full shrink-0 table-fixed border-collapse text-center text-xs">
        <thead>
          <tr className="text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <th key={d} className="pb-2 font-medium">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                const iso = day ? toIsoDate(viewYear, viewMonth, day) : null
                const isToday = iso === todayIso
                const isSelected = iso === selectedDate
                const hasAppts = day ? markedDays.has(day) : false

                return (
                  <td key={di} className="py-0.5">
                    {day && (
                      <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'relative mx-auto flex size-7 items-center justify-center rounded-full text-xs transition-colors',
                          isSelected
                            ? 'bg-primary font-semibold text-primary-foreground'
                            : isToday
                              ? 'bg-primary/15 font-semibold text-primary ring-1 ring-primary/40'
                              : 'text-foreground hover:bg-muted',
                        )}
                      >
                        {day}
                        {hasAppts && !isSelected && (
                          <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
                        )}
                      </button>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Day appointments panel */}
      <div
        className={cn(
          'mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border-t pt-3 transition-colors',
          selectedDate === todayIso && 'border-t-0 bg-primary/5 px-3 pt-3 ring-1 ring-primary/20',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {selectedDate === todayIso && (
                <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Today
                </span>
              )}
              <h3 className="truncate text-sm font-semibold">
                {selectedDate === todayIso
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                  : formatHeading(selectedDate)}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {dayAppointments.length === 0
                ? 'No appointments'
                : `${dayAppointments.length} appointment${dayAppointments.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <CalendarPlus className="size-3.5" />
            Add
          </button>
        </div>

        {dayAppointments.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Click &ldquo;Add&rdquo; to schedule an appointment for this day.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {dayAppointments.map((appt) => (
              <li
                key={appt.id}
                onClick={() => handleApptClick(appt)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60',
                  selectedDate === todayIso && 'bg-card shadow-sm hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 size-1.5 shrink-0 rounded-full',
                    STATUS_DOT[appt.status] ?? 'bg-primary',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {appt.patient.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appt.time} · {appt.dentist.name}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {appt.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddAppointmentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        patients={patients}
        dentists={dentists}
        initialDate={selectedDate}
        onAdd={handleAppointmentAdded}
      />

      <AppointmentDetailsDialog
        appointment={detailsAppt}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        allAppointments={appointments}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  )
}
