import {
  AlertTriangle,
  CircleDollarSign,
  Receipt,
  TrendingUp,
} from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import {
  computeInvoicesSummary,
  type InvoiceRow,
} from '@/components/invoices/data'
import { formatCurrency } from '@/lib/utils'

interface InvoicesSummaryCardsProps {
  invoices: InvoiceRow[]
}

export function InvoicesSummaryCards({ invoices }: InvoicesSummaryCardsProps) {
  const summary = computeInvoicesSummary(invoices)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Invoiced"
        value={formatCurrency(summary.totalInvoiced)}
        icon={Receipt}
        helperText="across all invoices"
      />
      <StatCard
        label="Outstanding Balance"
        value={formatCurrency(summary.outstandingBalance)}
        icon={CircleDollarSign}
        helperText="awaiting payment"
      />
      <StatCard
        label="Overdue Invoices"
        value={String(summary.overdueCount)}
        icon={AlertTriangle}
        helperText="past due date"
      />
      <StatCard
        label="Collection Rate"
        value={`${summary.collectionRate}%`}
        icon={TrendingUp}
        helperText="of invoiced total"
      />
    </div>
  )
}
