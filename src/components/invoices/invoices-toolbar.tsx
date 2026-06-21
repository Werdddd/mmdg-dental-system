'use client'

import { ListToolbar } from '@/components/shared/list-toolbar'

export type InvoicesSortOption =
  | 'Recent'
  | 'Oldest'
  | 'Amount (High to Low)'
  | 'Due Date'
  | 'Patient (A–Z)'

const SORT_OPTIONS: InvoicesSortOption[] = [
  'Recent',
  'Oldest',
  'Amount (High to Low)',
  'Due Date',
  'Patient (A–Z)',
]

interface InvoicesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sort: InvoicesSortOption
  onSortChange: (value: InvoicesSortOption) => void
  onNewClick: () => void
}

export function InvoicesToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onNewClick,
}: InvoicesToolbarProps) {
  return (
    <ListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search invoices…"
      sort={sort}
      sortOptions={SORT_OPTIONS}
      onSortChange={onSortChange}
      primaryLabel="New Invoice"
      onPrimaryClick={onNewClick}
    />
  )
}
