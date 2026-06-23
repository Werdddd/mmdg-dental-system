'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DentistOption } from '@/lib/data/dentists'

interface DentistPickerProps {
  dentists: DentistOption[]
  value: string
  onValueChange: (id: string) => void
}

export function DentistPicker({
  dentists,
  value,
  onValueChange,
}: DentistPickerProps) {
  if (dentists.length === 0) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium">Dentist</label>
        <p className="text-sm text-muted-foreground">
          No dentists assigned to this clinic yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">Dentist</label>
      <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {(id: string) => {
              const dentist = dentists.find((d) => d.id === id)
              return dentist
                ? `${dentist.name} — ${dentist.specialty}`
                : 'Select a dentist'
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {dentists.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name} — {d.specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
