'use client'

import { Plus, Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SortOption = 'Recent' | 'Oldest' | 'Patient (A–Z)' | 'Status'

const SORT_OPTIONS: SortOption[] = [
  'Recent',
  'Oldest',
  'Patient (A–Z)',
  'Status',
]

interface AppointmentsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
}

export function AppointmentsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: AppointmentsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments…"
            className="pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-1.5">
          <SlidersHorizontal className="size-4" />
          Filter
        </Button>

        <Select
          value={sort}
          onValueChange={(value) => value && onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="gap-1.5">
        <Plus className="size-4" />
        New Appointment
      </Button>
    </div>
  )
}
