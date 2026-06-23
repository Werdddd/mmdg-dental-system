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
}

export function PatientPicker({
  patients,
  value,
  onValueChange,
}: PatientPickerProps) {
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
              if (!patient) return 'Select a patient'
              return patient.phone
                ? `${patient.name} — ${patient.phone}`
                : patient.name
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {patient.name}
              {patient.phone ? ` — ${patient.phone}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
