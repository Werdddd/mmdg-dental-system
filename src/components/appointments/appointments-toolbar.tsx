'use client'

import type { ReactNode } from 'react'

import { ListToolbar } from '@/components/shared/list-toolbar'

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
  onNewClick: () => void
  onExportClick: () => void
  extra?: ReactNode
}

export function AppointmentsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onNewClick,
  onExportClick,
  extra,
}: AppointmentsToolbarProps) {
  return (
    <ListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search appointments…"
      sort={sort}
      sortOptions={SORT_OPTIONS}
      onSortChange={onSortChange}
      primaryLabel="New Appointment"
      onPrimaryClick={onNewClick}
      onExportClick={onExportClick}
      extra={extra}
    />
  )
}
