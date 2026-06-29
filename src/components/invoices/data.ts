export type InvoiceStatus = 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid'

export interface InvoiceItemRow {
  id: string
  treatmentRecordId: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceRow {
  rawId: string
  id: string
  patientId: string
  patient: { name: string; initials: string; phone: string }
  items: InvoiceItemRow[]
  createdDate: string
  dueDate: string
  subtotal: number
  total: number
  balance: number
  status: InvoiceStatus
}

export function computeInvoicesSummary(invoices: InvoiceRow[]) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const outstandingBalance = invoices.reduce((sum, inv) => sum + inv.balance, 0)

  return {
    totalInvoiced,
    outstandingBalance,
    overdueCount: invoices.filter((inv) => inv.status === 'Overdue').length,
    collectionRate:
      totalInvoiced === 0
        ? 0
        : Math.round(
            ((totalInvoiced - outstandingBalance) / totalInvoiced) * 100,
          ),
  }
}
