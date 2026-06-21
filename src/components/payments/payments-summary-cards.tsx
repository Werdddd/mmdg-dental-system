import { Banknote, CheckCircle2, Clock, RotateCcw } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { PAYMENTS_SUMMARY } from '@/components/payments/data'
import { formatCurrency } from '@/lib/utils'

export function PaymentsSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Revenue"
        value={formatCurrency(PAYMENTS_SUMMARY.totalRevenue)}
        icon={Banknote}
        helperText="collected to date"
      />
      <StatCard
        label="Paid Payments"
        value={String(PAYMENTS_SUMMARY.paidCount)}
        icon={CheckCircle2}
        helperText="completed transactions"
      />
      <StatCard
        label="Pending Payments"
        value={String(PAYMENTS_SUMMARY.pendingCount)}
        icon={Clock}
        helperText="unpaid or partial"
      />
      <StatCard
        label="Refunded Amount"
        value={formatCurrency(PAYMENTS_SUMMARY.refundedAmount)}
        icon={RotateCcw}
        helperText="returned to patients"
      />
    </div>
  )
}
