'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input' // used for date/time fields
import { Badge } from '@/components/ui/badge'
import { PatientPicker } from '@/components/shared/patient-picker'
import { DentistPicker } from '@/components/shared/dentist-picker'
import { TimeSlotPicker } from '@/components/shared/time-slot-picker'
import { RadiographConsentDialog } from '@/components/appointments/radiograph-consent-dialog'
import { useClinicContext } from '@/components/layout/clinic-context'
import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'
import type { PatientRow } from '@/components/patients/data'
import type { DentistOption } from '@/lib/data/dentists'
import type { PatientSearchResult } from '@/lib/data/patients'
import { addAppointmentAction } from '@/app/(app)/appointments/actions'
import { getPatientByIdAction } from '@/app/(app)/patients/actions'
import { searchPatientsAction } from '@/app/actions/search-patients'

const SEARCH_MIN_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 250

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
  const { activeClinicId } = useClinicContext()
  const [patientId, setPatientId] = useState('')
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? '')
  const [date, setDate] = useState(initialDate ?? '')
  const [time, setTime] = useState('')
  const [status] = useState<AppointmentStatus>('Scheduled')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radiographPrompt, setRadiographPrompt] = useState<{
    patientId: string
    patientName: string
    patientAddress: string
    dentistName: string
  } | null>(null)

  // Patients found via cross-clinic search (a patient whose home clinic
  // isn't the active one) get added here so they show up in the picker
  // alongside this clinic's own patients — mirrors the "any clinic can
  // treat a shared patient" pattern used for treatment records.
  const [otherClinicPatients, setOtherClinicPatients] = useState<PatientRow[]>(
    [],
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const latestSearchRef = useRef('')

  const pickablePatients = useMemo(() => {
    const ownIds = new Set(patients.map((p) => p.id))
    return [
      ...patients,
      ...otherClinicPatients.filter((p) => !ownIds.has(p.id)),
    ]
  }, [patients, otherClinicPatients])

  // Sync the pre-filled date whenever the dialog opens with a new initialDate
  useEffect(() => {
    if (open) setDate(initialDate ?? '')
  }, [open, initialDate])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    latestSearchRef.current = trimmed
    if (trimmed.length < SEARCH_MIN_LENGTH) return

    const handle = setTimeout(() => {
      setIsSearching(true)
      searchPatientsAction(trimmed)
        .then((found) => {
          if (latestSearchRef.current === trimmed) setSearchResults(found)
        })
        .finally(() => setIsSearching(false))
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSelectSearchResult(result: PatientSearchResult) {
    setShowSearchDropdown(false)
    setSearchQuery('')
    setSearchResults([])
    const full = await getPatientByIdAction(result.id)
    if (full) {
      setOtherClinicPatients((prev) =>
        prev.some((p) => p.id === full.id) ? prev : [...prev, full],
      )
      setPatientId(full.id)
    }
  }

  function resetForm() {
    setPatientId('')
    setDentistId(dentists[0]?.id ?? '')
    setDate(initialDate ?? '')
    setTime('')
    setNotes('')
    setError(null)
    setOtherClinicPatients([])
    setSearchQuery('')
    setSearchResults([])
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
        status,
        notes: notes.trim(),
      })
      onAdd(appointment)

      if (appointment.isFirstAppointment) {
        const patient = pickablePatients.find((p) => p.id === patientId)
        const dentist = dentists.find((d) => d.id === dentistId)
        setRadiographPrompt({
          patientId,
          patientName: patient?.name ?? '',
          patientAddress: patient?.address ?? '',
          dentistName: dentist?.name ?? '',
        })
      }

      resetForm()
      onOpenChange(false)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not add appointment. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
              patients={pickablePatients}
              value={patientId}
              onValueChange={setPatientId}
              activeClinicId={activeClinicId ?? undefined}
            />

            <div ref={searchContainerRef} className="relative">
              <label className="mb-1.5 block text-sm font-medium">
                Or search a patient from another clinic
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or patient ID…"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setShowSearchDropdown(true)
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                />
              </div>

              {showSearchDropdown &&
                searchQuery.trim().length >= SEARCH_MIN_LENGTH && (
                  <div className="absolute top-full left-0 z-40 mt-1.5 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
                    {isSearching ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Searching…
                      </div>
                    ) : searchResults.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        No patients found for &ldquo;{searchQuery.trim()}
                        &rdquo;.
                      </p>
                    ) : (
                      <ul className="max-h-60 divide-y overflow-y-auto">
                        {searchResults.map((result) => (
                          <li key={result.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectSearchResult(result)}
                              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-muted/60"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {result.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {result.patientCode}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-[10px]"
                              >
                                {result.clinicName}
                              </Badge>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
            </div>

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

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Treatment Plan{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Routine cleaning, root canal, braces adjustment…"
                rows={3}
                className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

      <RadiographConsentDialog
        open={radiographPrompt !== null}
        onOpenChange={(next) => {
          if (!next) setRadiographPrompt(null)
        }}
        patientId={radiographPrompt?.patientId ?? ''}
        patientName={radiographPrompt?.patientName ?? ''}
        patientAddress={radiographPrompt?.patientAddress ?? ''}
        defaultDentistName={radiographPrompt?.dentistName}
      />
    </>
  )
}
