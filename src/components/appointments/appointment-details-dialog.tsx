'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  History,
  Stethoscope,
  RefreshCw,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  updateAppointmentStatusAction,
  addAppointmentAction,
} from '@/app/(app)/appointments/actions'
import type { AppointmentRow, AppointmentStatus } from '@/components/appointments/data'
import {
  STATUS_VARIANT,
  VALID_TRANSITIONS,
  ACTIVE_STATUSES,
  getNotesLabel,
} from '@/components/appointments/data'

// ── helpers ───────────────────────────────────────────────────────────────────

function isSamePatient(a: AppointmentRow, b: AppointmentRow) {
  return a.patient.id ? a.patient.id === b.patient.id : a.patient.name === b.patient.name
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Status chip styles — maps status to a selected/unselected colour pair
const STATUS_CHIP: Record<AppointmentStatus, { base: string; active: string }> = {
  Scheduled:     { base: 'border-sky-200 text-sky-700 hover:bg-sky-50',      active: 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-400' },
  'In Progress': { base: 'border-violet-200 text-violet-700 hover:bg-violet-50', active: 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-400' },
  Completed:     { base: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50', active: 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400' },
  Cancelled:     { base: 'border-red-200 text-red-700 hover:bg-red-50',       active: 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' },
  'No Show':     { base: 'border-gray-200 text-gray-600 hover:bg-gray-50',    active: 'border-gray-500 bg-gray-50 text-gray-700 ring-1 ring-gray-400' },
  Rescheduled:   { base: 'border-orange-200 text-orange-700 hover:bg-orange-50', active: 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-400' },
}

// ── Status update sub-dialog ──────────────────────────────────────────────────

interface StatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: AppointmentRow
  allAppointments: AppointmentRow[]
  onSave: (updated: AppointmentRow, newAppointment?: AppointmentRow) => void
}

function StatusUpdateDialog({ open, onOpenChange, current, allAppointments, onSave }: StatusDialogProps) {
  const [newStatus, setNewStatus] = useState<AppointmentStatus | ''>('')
  const [note, setNote] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const isRescheduling = newStatus === 'Rescheduled'
  const validNextStatuses = VALID_TRANSITIONS[current.status]

  const activeConflict = useMemo(() => {
    if (!newStatus || !ACTIVE_STATUSES.includes(newStatus as AppointmentStatus)) return null
    return allAppointments.find(
      (a) => a.id !== current.id && isSamePatient(a, current) && ACTIVE_STATUSES.includes(a.status),
    ) ?? null
  }, [current, newStatus, allAppointments])

  const canSave =
    newStatus !== '' &&
    newStatus !== current.status &&
    !activeConflict &&
    (!isRescheduling || (rescheduleDate !== '' && rescheduleTime !== ''))

  function reset() {
    setNewStatus('')
    setNote('')
    setRescheduleDate('')
    setRescheduleTime('')
    setSaveError(null)
  }

  useEffect(() => { if (!open) reset() }, [open])

  async function handleSave() {
    if (!canSave || isSaving) return
    setIsSaving(true)
    setSaveError(null)

    const resolvedStatus = newStatus as AppointmentStatus

    let noteEntry = ''
    if (isRescheduling) {
      const dateLabel = new Date(`${rescheduleDate}T${rescheduleTime}`).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
      const [hh, mm] = rescheduleTime.split(':')
      const hour = Number(hh)
      const timeLabel = `${hour % 12 || 12}:${mm} ${hour < 12 ? 'AM' : 'PM'}`
      noteEntry = `Rescheduled to ${dateLabel} at ${timeLabel}.`
      if (note.trim()) noteEntry += ` ${note.trim()}`
    } else if (note.trim()) {
      noteEntry = note.trim()
    }

    const stamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const updatedNotes = noteEntry
      ? current.notes
        ? `${current.notes}\n\n[${resolvedStatus} — ${stamp}]: ${noteEntry}`
        : `[${resolvedStatus} — ${stamp}]: ${noteEntry}`
      : current.notes

    try {
      await updateAppointmentStatusAction(current.id, resolvedStatus, updatedNotes || undefined)
      const updated: AppointmentRow = { ...current, status: resolvedStatus, notes: updatedNotes ?? current.notes }

      let newAppointment: AppointmentRow | undefined
      if (isRescheduling && rescheduleDate && rescheduleTime) {
        try {
          newAppointment = await addAppointmentAction({
            patientId: current.patient.id,
            dentistId: current.dentist.id,
            date: rescheduleDate,
            time: rescheduleTime,
            status: 'Scheduled',
            notes: current.notes,
          })
        } catch {
          setSaveError('Marked as rescheduled, but the new booking could not be created. Add it manually.')
          setIsSaving(false)
          onSave(updated)
          onOpenChange(false)
          return
        }
      }

      onSave(updated, newAppointment)
      onOpenChange(false)
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'Could not save changes. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Choose a new status for this appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current → new indicator */}
          <div className="flex items-center gap-2">
            <StatusBadge status={current.status} variants={STATUS_VARIANT} />
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
            {newStatus ? (
              <StatusBadge status={newStatus as AppointmentStatus} variants={STATUS_VARIANT} />
            ) : (
              <span className="text-sm text-muted-foreground">select below</span>
            )}
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            {validNextStatuses.map((s) => {
              const chip = STATUS_CHIP[s]
              const isSelected = newStatus === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setNewStatus(s)
                    setRescheduleDate('')
                    setRescheduleTime('')
                  }}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-all ${
                    isSelected ? chip.active : chip.base
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>

          {/* Reschedule date/time */}
          {isRescheduling && (
            <div className="space-y-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <CalendarClock className="size-3.5" />
                New appointment slot
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-blue-700">Date</label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    min={todayIso()}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="h-8 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-blue-700">Time</label>
                  <Input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="h-8 bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Overlap conflict warning */}
          {activeConflict && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                <strong>{current.patient.name}</strong> already has an{' '}
                <strong>{activeConflict.status}</strong> appointment on {activeConflict.date} at{' '}
                {activeConflict.time}. Resolve it first.
              </p>
            </div>
          )}

          {/* Note */}
          {newStatus && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Note{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  isRescheduling ? 'Reason for rescheduling…' : 'Reason for change, observations…'
                }
                className="min-h-[72px] text-sm"
              />
            </div>
          )}

          {saveError && (
            <p className="text-sm text-destructive" role="alert">{saveError}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? 'Saving…' : isRescheduling ? 'Reschedule & Book' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main details dialog ───────────────────────────────────────────────────────

interface AppointmentDetailsDialogProps {
  appointment: AppointmentRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  allAppointments?: AppointmentRow[]
  onStatusChanged?: (updated: AppointmentRow, newAppointment?: AppointmentRow) => void
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  allAppointments = [],
  onStatusChanged,
}: AppointmentDetailsDialogProps) {
  const [current, setCurrent] = useState<AppointmentRow | null>(appointment)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  useEffect(() => {
    setCurrent(appointment)
  }, [appointment])

  const history = useMemo(
    () =>
      allAppointments
        .filter((a) => current && a.id !== current.id && isSamePatient(a, current))
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [allAppointments, current],
  )

  const pastProcedures = useMemo(() => history.filter((a) => a.status === 'Completed'), [history])

  if (!current) return null

  const isTerminal = VALID_TRANSITIONS[current.status].length === 0

  function handleStatusSaved(updated: AppointmentRow, newAppointment?: AppointmentRow) {
    setCurrent(updated)
    onStatusChanged?.(updated, newAppointment)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 pr-6">
              <div>
                <DialogTitle>Appointment Details</DialogTitle>
                <DialogDescription className="mt-0.5">
                  {current.date} &middot; {current.time}
                </DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <StatusBadge status={current.status} variants={STATUS_VARIANT} />
                {!isTerminal && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    <RefreshCw className="size-3" />
                    Update
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-1">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1 gap-1.5">
                <ClipboardList className="size-3.5" />
                Details
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 gap-1.5">
                <History className="size-3.5" />
                Patient History
                {history.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {history.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Details tab ────────────────────────────────────────── */}
            <TabsContent value="details" className="mt-4 space-y-5">

              {/* Patient */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Patient
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{current.patient.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{current.patient.name}</p>
                    <p className="text-sm text-muted-foreground">{current.patient.phone}</p>
                  </div>
                </div>
              </div>

              {/* Dentist */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dentist
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{current.dentist.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{current.dentist.name}</p>
                    <p className="text-sm text-muted-foreground">{current.dentist.specialty}</p>
                  </div>
                  {current.clinic && (
                    <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                      {current.clinic.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {getNotesLabel(current.status)}
                </p>
                {current.notes ? (
                  <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
                    {current.notes}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No notes recorded.</p>
                )}
              </div>

              {/* Previous procedures snippet */}
              {pastProcedures.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Stethoscope className="size-3.5" />
                    Previous Procedures
                  </p>
                  <ul className="space-y-2">
                    {pastProcedures.slice(0, 3).map((appt) => (
                      <li key={appt.id} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {appt.date} &middot; {appt.dentist.name}
                          </span>
                          <StatusBadge status={appt.status} variants={STATUS_VARIANT} />
                        </div>
                        {appt.notes && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">{appt.notes}</p>
                        )}
                      </li>
                    ))}
                    {pastProcedures.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{pastProcedures.length - 3} more — see Patient History tab
                      </p>
                    )}
                  </ul>
                </div>
              )}
            </TabsContent>

            {/* ── History tab ────────────────────────────────────────── */}
            <TabsContent value="history" className="mt-4">
              <p className="mb-3 text-sm font-medium">
                {current.patient.name}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  &middot;{' '}
                  {history.length === 0
                    ? 'No previous appointments'
                    : `${history.length} previous appointment${history.length !== 1 ? 's' : ''}`}
                </span>
              </p>

              {history.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
                  <History className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No previous appointment records found.</p>
                </div>
              ) : (
                <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {history.map((appt) => (
                    <li key={appt.id} className="rounded-lg border bg-card p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">
                            {appt.date} &middot; {appt.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appt.dentist.name} &middot; {appt.dentist.specialty}
                            {appt.clinic && ` · ${appt.clinic.name}`}
                          </p>
                        </div>
                        <StatusBadge status={appt.status} variants={STATUS_VARIANT} />
                      </div>

                      {appt.notes && (
                        <div className="rounded-md border-l-2 border-l-violet-300 bg-muted/40 px-3 py-2">
                          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {getNotesLabel(appt.status)}
                          </p>
                          <p className="whitespace-pre-wrap text-xs text-foreground/80">{appt.notes}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Status update sub-dialog */}
      {!isTerminal && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          current={current}
          allAppointments={allAppointments}
          onSave={handleStatusSaved}
        />
      )}
    </>
  )
}
