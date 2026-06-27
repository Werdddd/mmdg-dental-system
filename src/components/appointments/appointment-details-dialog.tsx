'use client'

import { useEffect, useState } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { ClipboardList, History } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/status-badge'
import { updateAppointmentStatusAction } from '@/app/(app)/appointments/actions'
import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'

// ── constants ─────────────────────────────────────────────────────────────────

const STATUSES: AppointmentStatus[] = [
  'Confirmed',
  'Ongoing',
  'Completed',
  'Rescheduled',
  'Cancelled',
]

const STATUS_VARIANT: Record<
  AppointmentStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Confirmed: 'purple',
  Completed: 'success',
  Ongoing: 'warning',
  Cancelled: 'destructive',
  Rescheduled: 'info',
}

// ── component ─────────────────────────────────────────────────────────────────

interface AppointmentDetailsDialogProps {
  appointment: AppointmentRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  allAppointments?: AppointmentRow[]
  onStatusChanged?: (updated: AppointmentRow) => void
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  allAppointments = [],
  onStatusChanged,
}: AppointmentDetailsDialogProps) {
  // Local view — updated optimistically after a save
  const [current, setCurrent] = useState<AppointmentRow | null>(appointment)

  // Status-change form
  const [newStatus, setNewStatus] = useState<AppointmentStatus | ''>('')
  const [statusNote, setStatusNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sync when the parent passes a different appointment
  useEffect(() => {
    setCurrent(appointment)
    setNewStatus('')
    setStatusNote('')
    setSaveError(null)
  }, [appointment])

  if (!current) return null

  // Patient history — other appointments for the same patient (by id, fallback name)
  const history = allAppointments
    .filter((a) => {
      if (a.id === current.id) return false
      return current.patient.id
        ? a.patient.id === current.patient.id
        : a.patient.name === current.patient.name
    })
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))

  const isDirty =
    (newStatus !== '' && newStatus !== current.status) ||
    statusNote.trim().length > 0

  async function handleUpdate() {
    if (!isDirty || isSaving) return

    setIsSaving(true)
    setSaveError(null)

    const resolvedStatus =
      newStatus !== '' ? (newStatus as AppointmentStatus) : current!.status

    // Build the updated notes: append a timestamped note if one was provided
    let updatedNotes = current!.notes
    if (statusNote.trim()) {
      const stamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const entry = `[${resolvedStatus} — ${stamp}]: ${statusNote.trim()}`
      updatedNotes = updatedNotes ? `${updatedNotes}\n\n${entry}` : entry
    }

    try {
      await updateAppointmentStatusAction(
        current!.id,
        resolvedStatus,
        statusNote.trim() ? updatedNotes : undefined,
      )

      const updated: AppointmentRow = {
        ...current!,
        status: resolvedStatus,
        notes: updatedNotes,
      }
      setCurrent(updated)
      setNewStatus('')
      setStatusNote('')
      onStatusChanged?.(updated)
    } catch {
      setSaveError('Could not save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            {current.date} &middot; {current.time}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-0">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1 gap-1.5">
              <ClipboardList className="size-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              <History className="size-3.5" />
              Patient History
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {history.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Details tab ────────────────────────────────────────────── */}
          <TabsContent value="details" className="mt-4 space-y-5">
            {/* Patient */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Patient
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{current.patient.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{current.patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {current.patient.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Dentist */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Dentist
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{current.dentist.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{current.dentist.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {current.dentist.specialty}
                  </p>
                </div>
              </div>
            </div>

            {/* Treatment Done */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Treatment Done
              </p>
              {current.notes ? (
                <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
                  {current.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No treatment notes recorded.
                </p>
              )}
            </div>

            {/* Status update */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Status
                </p>
                <StatusBadge
                  status={current.status}
                  variants={STATUS_VARIANT}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Change to
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => v && setNewStatus(v as AppointmentStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new status…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.filter((s) => s !== current.status).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Note{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Reason for status change, observations…"
                  className="min-h-[70px]"
                />
              </div>

              {saveError && (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleUpdate}
                disabled={!isDirty || isSaving}
              >
                {isSaving ? 'Saving…' : 'Update Appointment'}
              </Button>
            </div>
          </TabsContent>

          {/* ── History tab ────────────────────────────────────────────── */}
          <TabsContent value="history" className="mt-4">
            <p className="mb-3 text-sm font-medium">
              {current.patient.name}
              <span className="ml-1.5 font-normal text-muted-foreground">
                ·{' '}
                {history.length === 0
                  ? 'No previous appointments'
                  : `${history.length} previous appointment${history.length !== 1 ? 's' : ''}`}
              </span>
            </p>

            {history.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
                <History className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No previous appointment records found.
                </p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {history.map((appt) => (
                  <li
                    key={appt.id}
                    className="rounded-lg border bg-card p-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {appt.date} · {appt.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appt.dentist.name} · {appt.dentist.specialty}
                        </p>
                      </div>
                      <StatusBadge
                        status={appt.status}
                        variants={STATUS_VARIANT}
                      />
                    </div>
                    {appt.notes && (
                      <p className="text-xs text-muted-foreground border-t pt-1.5 whitespace-pre-wrap">
                        {appt.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
