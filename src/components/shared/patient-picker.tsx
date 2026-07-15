'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PatientRow } from '@/components/patients/data'

interface PatientPickerProps {
  patients: PatientRow[]
  value: string
  onValueChange: (id: string) => void
  // When set, patients whose clinicId differs from this are labelled with
  // their home clinic (e.g. cross-clinic appointment booking). Omit to
  // leave labels unchanged.
  activeClinicId?: string
}

export function PatientPicker({
  patients,
  value,
  onValueChange,
  activeClinicId,
}: PatientPickerProps) {
  function labelFor(patient: PatientRow) {
    let label = patient.phone
      ? `${patient.name} — ${patient.phone}`
      : patient.name
    if (activeClinicId && patient.clinicId !== activeClinicId) {
      label += ` (${patient.clinicName})`
    }
    return label
  }

  if (patients.length === 0) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium">Patient</label>
        <p className="text-sm text-muted-foreground">
          No patients yet — add a patient first before scheduling.
        </p>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">Patient</label>
      <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {(id: string) => {
              const patient = patients.find((p) => p.id === id)
              return patient ? labelFor(patient) : 'Select a patient'
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {labelFor(patient)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
