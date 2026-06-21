'use client'

import { useState } from 'react'

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
import { PatientFields } from '@/components/shared/patient-fields'
import { DENTISTS } from '@/components/shared/clinic-roster'
import type {
  AppointmentMode,
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'
import {
  formatDisplayDate,
  formatDisplayTime,
  initialsOf,
  nextSequentialId,
} from '@/lib/utils'

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
  appointments: AppointmentRow[]
  onAdd: (appointment: AppointmentRow) => void
}

export function AddAppointmentDialog({
  open,
  onOpenChange,
  appointments,
  onAdd,
}: AddAppointmentDialogProps) {
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [dentistId, setDentistId] = useState(DENTISTS[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [mode, setMode] = useState<AppointmentMode>('In-person')
  const [status, setStatus] = useState<AppointmentStatus>('Confirmed')

  function resetForm() {
    setPatientName('')
    setPatientPhone('')
    setDentistId(DENTISTS[0]?.id ?? '')
    setDate('')
    setTime('')
    setMode('In-person')
    setStatus('Confirmed')
  }

  const dentist = DENTISTS.find((d) => d.id === dentistId)
  const canSubmit =
    patientName.trim().length > 0 &&
    patientPhone.trim().length > 0 &&
    dentist != null &&
    date.length > 0 &&
    time.length > 0

  function handleSubmit() {
    if (!canSubmit || !dentist) return

    onAdd({
      id: nextSequentialId(appointments, (a) => a.id, 'apt-'),
      date: formatDisplayDate(date),
      time: formatDisplayTime(time),
      patient: {
        name: patientName.trim(),
        initials: initialsOf(patientName),
        phone: patientPhone.trim(),
      },
      dentist: {
        name: dentist.name,
        initials: dentist.initials,
        specialty: dentist.specialty,
      },
      mode,
      status,
    })
    resetForm()
    onOpenChange(false)
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
          <PatientFields
            name={patientName}
            onNameChange={setPatientName}
            phone={patientPhone}
            onPhoneChange={setPatientPhone}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">Dentist</label>
            <Select
              value={dentistId}
              onValueChange={(value) => value && setDentistId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DENTISTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
