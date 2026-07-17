'use client'

import { Building2 } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Sentinel select value meaning "don't filter by clinic" — distinct from any
// real clinic uuid.
export const ALL_CLINICS = 'all'

export interface ClinicFilterOption {
  id: string
  name: string
}

interface ClinicFilterSelectProps {
  options: ClinicFilterOption[]
  value: string
  onValueChange: (value: string) => void
  ownClinicId?: string | null
  className?: string
}

export function ClinicFilterSelect({
  options,
  value,
  onValueChange,
  ownClinicId,
  className,
}: ClinicFilterSelectProps) {
  const activeLabel =
    value === ALL_CLINICS
      ? 'All Clinics'
      : (options.find((o) => o.id === value)?.name ?? 'Select clinic')

  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger className={className ?? 'h-9 w-full gap-2 sm:w-52'}>
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Filter by clinic">{activeLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value={ALL_CLINICS}>All Clinics</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
            {o.id === ownClinicId ? ' (My Clinic)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
