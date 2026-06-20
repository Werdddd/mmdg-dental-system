'use client'

import { LayoutGrid, List, Plus, Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PatientsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function PatientsToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
}: PatientsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients…"
            className="pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-1.5">
          <SlidersHorizontal className="size-4" />
          Filter
        </Button>

        <div className="inline-flex items-center rounded-lg border p-1">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
            className={cn(
              'flex size-7 items-center justify-center rounded-md',
              view === 'grid'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
            className={cn(
              'flex size-7 items-center justify-center rounded-md',
              view === 'list'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      <Button className="gap-1.5">
        <Plus className="size-4" />
        New Patient
      </Button>
    </div>
  )
}
