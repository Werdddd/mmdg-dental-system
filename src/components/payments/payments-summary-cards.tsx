import { Banknote, CheckCircle2, HeartHandshake, RotateCcw } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import {
  computePaymentsSummary,
  type PaymentRow,
} from '@/components/payments/data'
import { formatCurrency } from '@/lib/utils'

interface PaymentsSummaryCardsProps {
  payments: PaymentRow[]
}

export function PaymentsSummaryCards({ payments }: PaymentsSummaryCardsProps) {
  const summary = computePaymentsSummary(payments)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Revenue"
        value={formatCurrency(summary.totalRevenue)}
        icon={Banknote}
        helperText="collected to date"
      />
      <StatCard
        label="Completed Payments"
        value={String(summary.paidCount)}
        icon={CheckCircle2}
        helperText="completed transactions"
      />
      <StatCard
        label="Sponsored / Pro Bono"
        value={formatCurrency(summary.coverageAmount)}
        icon={HeartHandshake}
        helperText="covered on patients' behalf"
      />
      <StatCard
        label="Refunded Amount"
        value={formatCurrency(summary.refundedAmount)}
        icon={RotateCcw}
        helperText="returned to patients"
      />
    </div>
  )
}
