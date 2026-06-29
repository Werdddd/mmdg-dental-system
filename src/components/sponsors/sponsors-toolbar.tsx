'use client'

import { ListToolbar } from '@/components/shared/list-toolbar'

export type SponsorsSortOption =
  | 'Recent'
  | 'Oldest'
  | 'Name (A–Z)'
  | 'Coverage (High to Low)'

const SORT_OPTIONS: SponsorsSortOption[] = [
  'Recent',
  'Oldest',
  'Name (A–Z)',
  'Coverage (High to Low)',
]

interface SponsorsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: SponsorsSortOption
  onSortChange: (value: SponsorsSortOption) => void
  onNewClick: () => void
}

export function SponsorsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onNewClick,
}: SponsorsToolbarProps) {
  return (
    <ListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search sponsors…"
      sort={sort}
      sortOptions={SORT_OPTIONS}
      onSortChange={onSortChange}
      primaryLabel="New Sponsor"
      onPrimaryClick={onNewClick}
    />
  )
}
