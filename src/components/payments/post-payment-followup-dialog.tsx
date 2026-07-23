'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
import { DentistPicker } from '@/components/shared/dentist-picker'
import { TimeSlotPicker } from '@/components/shared/time-slot-picker'
import type { DentistOption } from '@/lib/data/dentists'
import { addAppointmentAction } from '@/app/(app)/appointments/actions'
import { setPatientRecallAction } from '@/app/(app)/patients/actions'

type FollowUpMode = 'schedule' | 'recall'

interface PostPaymentFollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  dentists: DentistOption[]
}

export function PostPaymentFollowUpDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  dentists,
}: PostPaymentFollowUpDialogProps) {
  const router = useRouter()
  const [mode, setMode] = useState<FollowUpMode>('schedule')
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [recallDate, setRecallDate] = useState('')
  const [recallNote, setRecallNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setMode('schedule')
    setDentistId(dentists[0]?.id ?? '')
    setDate('')
    setTime('')
    setRecallDate('')
    setRecallNote('')
    setError(null)
  }

  const canSchedule =
    dentistId.length > 0 && date.length > 0 && time.length > 0 && !isSubmitting
  const canSetRecall = recallDate.length > 0 && !isSubmitting

  async function handleSchedule() {
    if (!canSchedule) return
    setIsSubmitting(true)
    setError(null)
    try {
      await addAppointmentAction({
        patientId,
        dentistId,
        date,
        time,
        status: 'Scheduled',
        notes: '',
      })
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not book the appointment. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSetRecall() {
    if (!canSetRecall) return
    setIsSubmitting(true)
    setError(null)
    try {
      await setPatientRecallAction(patientId, recallDate, recallNote)
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Could not save the recall date. Please try again.')
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
          <DialogTitle>Plan the Next Visit</DialogTitle>
          <DialogDescription>
            Payment recorded for {patientName || 'this patient'}. Book their
            next appointment now, or set a date to follow up later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'schedule' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('schedule')}
          >
            Schedule Appointment
          </Button>
          <Button
            type="button"
            variant={mode === 'recall' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('recall')}
          >
            Set Recall Date
          </Button>
        </div>

        {mode === 'schedule' ? (
          <div className="space-y-4">
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
              <TimeSlotPicker
                value={time}
                onValueChange={setTime}
                label="Time"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Recall Date
              </label>
              <Input
                type="date"
                value={recallDate}
                onChange={(event) => setRecallDate(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Note{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                value={recallNote}
                onChange={(event) => setRecallNote(event.target.value)}
                placeholder="e.g. Call to confirm follow-up cleaning"
                rows={3}
                className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          {mode === 'schedule' ? (
            <Button onClick={handleSchedule} disabled={!canSchedule}>
              {isSubmitting ? 'Booking…' : 'Book Appointment'}
            </Button>
          ) : (
            <Button onClick={handleSetRecall} disabled={!canSetRecall}>
              {isSubmitting ? 'Saving…' : 'Save Recall Date'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
