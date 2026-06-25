'use client'

import { useEffect, useState } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PatientPicker } from '@/components/shared/patient-picker'
import { DentistPicker } from '@/components/shared/dentist-picker'
import type {
  AppointmentMode,
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'
import type { PatientRow } from '@/components/patients/data'
import type { DentistOption } from '@/lib/data/dentists'
import { addAppointmentAction } from '@/app/(app)/appointments/actions'

const MODES: AppointmentMode[] = ['In-person', 'Video Call', 'Phone Call']
const STATUSES: AppointmentStatus[] = [
  'Confirmed',
  'Ongoing',
  'Completed',
  'Cancelled',
  'Rescheduled',
]

interface AddAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientRow[]
  dentists: DentistOption[]
  onAdd: (appointment: AppointmentRow) => void
  initialDate?: string // ISO date "YYYY-MM-DD" to pre-fill
}

export function AddAppointmentDialog({
  open,
  onOpenChange,
  patients,
  dentists,
  onAdd,
  initialDate,
}: AddAppointmentDialogProps) {
  const [patientId, setPatientId] = useState('')
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? '')
  const [date, setDate] = useState(initialDate ?? '')
  const [time, setTime] = useState('')
  const [mode, setMode] = useState<AppointmentMode>('In-person')
  const [status, setStatus] = useState<AppointmentStatus>('Confirmed')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync the pre-filled date whenever the dialog opens with a new initialDate
  useEffect(() => {
    if (open) setDate(initialDate ?? '')
  }, [open, initialDate])

  function resetForm() {
    setPatientId('')
    setDentistId(dentists[0]?.id ?? '')
    setDate(initialDate ?? '')
    setTime('')
    setMode('In-person')
    setStatus('Confirmed')
    setNotes('')
    setError(null)
  }

  const canSubmit =
    patientId.length > 0 &&
    dentistId.length > 0 &&
    date.length > 0 &&
    time.length > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const appointment = await addAppointmentAction({
        patientId,
        dentistId,
        date,
        time,
        mode,
        status,
        notes: notes.trim(),
      })
      onAdd(appointment)
      resetForm()
      onOpenChange(false)
    } catch {
      setError('Could not add appointment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new patient appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PatientPicker
            patients={patients}
            value={patientId}
            onValueChange={setPatientId}
          />

          <DentistPicker
            dentists={dentists}
            value={dentistId}
            onValueChange={setDentistId}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mode</label>
              <Select
                value={mode}
                onValueChange={(value) =>
                  value && setMode(value as AppointmentMode)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(value) =>
                  value && setStatus(value as AppointmentStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Reason / Notes
            </label>
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Routine Cleaning"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Adding…' : 'Add Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
