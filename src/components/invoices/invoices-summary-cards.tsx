import {
  AlertTriangle,
  CircleDollarSign,
  Receipt,
  TrendingUp,
} from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { INVOICES_SUMMARY } from '@/components/invoices/data'
import { formatCurrency } from '@/lib/utils'

export function InvoicesSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Invoiced"
        value={formatCurrency(INVOICES_SUMMARY.totalInvoiced)}
        icon={Receipt}
        helperText="across all invoices"
      />
      <StatCard
        label="Outstanding Balance"
        value={formatCurrency(INVOICES_SUMMARY.outstandingBalance)}
        icon={CircleDollarSign}
        helperText="awaiting payment"
      />
      <StatCard
        label="Overdue Invoices"
        value={String(INVOICES_SUMMARY.overdueCount)}
        icon={AlertTriangle}
        helperText="past due date"
      />
      <StatCard
        label="Collection Rate"
        value={`${INVOICES_SUMMARY.collectionRate}%`}
        icon={TrendingUp}
        helperText="of invoiced total"
      />
    </div>
  )
}
