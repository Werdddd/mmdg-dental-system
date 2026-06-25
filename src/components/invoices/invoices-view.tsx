'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/shared/pagination'
import { ClinicSelector } from '@/components/layout/clinic-selector'
import { useClinicContext } from '@/components/layout/clinic-context'
import { AddInvoiceDialog } from '@/components/invoices/add-invoice-dialog'
import { InvoicesSummaryCards } from '@/components/invoices/invoices-summary-cards'
import { InvoicesTable } from '@/components/invoices/invoices-table'
import {
  InvoicesToolbar,
  type InvoicesSortOption,
} from '@/components/invoices/invoices-toolbar'
import { type InvoiceRow } from '@/components/invoices/data'
import type { PatientRow } from '@/components/patients/data'

const PAGE_SIZE_OPTIONS = ['5', '10', '25', '50']

interface InvoicesViewProps {
  initialInvoices: InvoiceRow[]
  patients: PatientRow[]
}

export function InvoicesView({ initialInvoices, patients }: InvoicesViewProps) {
  const { clinics, activeClinicId, isSuperAdmin } = useClinicContext()
  const [invoices, setInvoices] = useState<InvoiceRow[]>(initialInvoices)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<InvoicesSortOption>('Recent')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = query
      ? invoices.filter(
          (invoice) =>
            invoice.patient.name.toLowerCase().includes(query) ||
            invoice.id.toLowerCase().includes(query) ||
            invoice.treatment.toLowerCase().includes(query),
        )
      : [...invoices]

    switch (sort) {
      case 'Oldest':
        return rows.reverse()
      case 'Amount (High to Low)':
        return rows.sort((a, b) => b.total - a.total)
      case 'Due Date':
        return rows.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        )
      case 'Patient (A–Z)':
        return rows.sort((a, b) => a.patient.name.localeCompare(b.patient.name))
      case 'Recent':
      default:
        return rows
    }
  }, [invoices, search, sort])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = filtered.slice(start, start + size)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: InvoicesSortOption) {
    setSort(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(value)
    setPage(1)
  }

  function handleAddInvoice(invoice: InvoiceRow) {
    setInvoices((prev) => [invoice, ...prev])
    setPage(1)
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
            <Badge variant="purple">{invoices.length} total invoices</Badge>
          </div>
          {isSuperAdmin && activeClinicId && clinics.length > 0 && (
            <ClinicSelector clinics={clinics} activeClinicId={activeClinicId} />
          )}
        </div>
        <p className="text-muted-foreground">
          Manage billing, due dates, and outstanding balances per patient.
        </p>
      </div>

      <InvoicesSummaryCards invoices={invoices} />

      <InvoicesToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        onNewClick={() => setAddOpen(true)}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <InvoicesTable invoices={visible} />

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <AddInvoiceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        patients={patients}
        onAdd={handleAddInvoice}
      />
    </>
  )
}
