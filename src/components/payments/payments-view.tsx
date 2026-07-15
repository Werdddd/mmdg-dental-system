'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/shared/pagination'
import { ClinicSelector } from '@/components/layout/clinic-selector'
import { useClinicContext } from '@/components/layout/clinic-context'
import { AddPaymentDialog } from '@/components/payments/add-payment-dialog'
import { PaymentsSummaryCards } from '@/components/payments/payments-summary-cards'
import { PaymentsTable } from '@/components/payments/payments-table'
import {
  PaymentsToolbar,
  type PaymentsSortOption,
} from '@/components/payments/payments-toolbar'
import { type PaymentRow } from '@/components/payments/data'
import type { InvoiceRow } from '@/components/invoices/data'

const PAGE_SIZE_OPTIONS = ['5', '10', '25', '50']

interface PaymentsViewProps {
  initialPayments: PaymentRow[]
  invoicesWithBalance: InvoiceRow[]
}

export function PaymentsView({
  initialPayments,
  invoicesWithBalance,
}: PaymentsViewProps) {
  const { clinics, activeClinicId } = useClinicContext()
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<PaymentsSortOption>('Recent')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = query
      ? payments.filter(
          (payment) =>
            payment.patient.name.toLowerCase().includes(query) ||
            payment.id.toLowerCase().includes(query) ||
            payment.invoiceId.toLowerCase().includes(query) ||
            payment.service.toLowerCase().includes(query),
        )
      : [...payments]

    switch (sort) {
      case 'Oldest':
        return rows.reverse()
      case 'Amount (High to Low)':
        return rows.sort((a, b) => b.amount - a.amount)
      case 'Amount (Low to High)':
        return rows.sort((a, b) => a.amount - b.amount)
      case 'Patient (A–Z)':
        return rows.sort((a, b) => a.patient.name.localeCompare(b.patient.name))
      case 'Recent':
      default:
        return rows
    }
  }, [payments, search, sort])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = filtered.slice(start, start + size)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: PaymentsSortOption) {
    setSort(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(value)
    setPage(1)
  }

  function handleAddPayment(payment: PaymentRow) {
    setPayments((prev) => [payment, ...prev])
    setPage(1)
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
            <Badge variant="purple">{payments.length} total payments</Badge>
          </div>
          {activeClinicId && clinics.length > 1 && (
            <ClinicSelector clinics={clinics} activeClinicId={activeClinicId} />
          )}
        </div>
        <p className="text-muted-foreground">
          Track patient payments, methods, and outstanding balances.
        </p>
      </div>

      <PaymentsSummaryCards payments={payments} />

      <PaymentsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        onNewClick={() => setAddOpen(true)}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <PaymentsTable payments={visible} />

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

      <AddPaymentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        invoices={invoicesWithBalance}
        onAdd={handleAddPayment}
      />
    </>
  )
}
