'use client'

import { LayoutGrid, List } from 'lucide-react'

import { ListToolbar } from '@/components/shared/list-toolbar'
import { cn } from '@/lib/utils'

export type PatientsSortOption =
  | 'Recent'
  | 'Oldest'
  | 'Name (A–Z)'
  | 'Age (Oldest First)'

const SORT_OPTIONS: PatientsSortOption[] = [
  'Recent',
  'Oldest',
  'Name (A–Z)',
  'Age (Oldest First)',
]

interface PatientsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: PatientsSortOption
  onSortChange: (value: PatientsSortOption) => void
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function PatientsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: PatientsToolbarProps) {
  return (
    <ListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search patients…"
      sort={sort}
      sortOptions={SORT_OPTIONS}
      onSortChange={onSortChange}
      primaryLabel="New Patient"
      extra={
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
      }
    />
  )
}
