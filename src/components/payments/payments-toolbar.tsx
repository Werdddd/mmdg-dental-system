'use client'

import { ListToolbar } from '@/components/shared/list-toolbar'

export type PaymentsSortOption =
  | 'Recent'
  | 'Oldest'
  | 'Amount (High to Low)'
  | 'Amount (Low to High)'
  | 'Patient (A–Z)'

const SORT_OPTIONS: PaymentsSortOption[] = [
  'Recent',
  'Oldest',
  'Amount (High to Low)',
  'Amount (Low to High)',
  'Patient (A–Z)',
]

interface PaymentsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: PaymentsSortOption
  onSortChange: (value: PaymentsSortOption) => void
  onNewClick: () => void
  onExportClick: () => void
}

export function PaymentsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onNewClick,
  onExportClick,
}: PaymentsToolbarProps) {
  return (
    <ListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search payments…"
      sort={sort}
      sortOptions={SORT_OPTIONS}
      onSortChange={onSortChange}
      primaryLabel="New Payment"
      onPrimaryClick={onNewClick}
      onExportClick={onExportClick}
    />
  )
}
