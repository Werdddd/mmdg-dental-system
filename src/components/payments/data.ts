import type { SignatureValue } from '@/lib/dental/signature'

export type PaymentMethod = 'Cash' | 'Bank' | 'GCash' | 'Sponsored' | 'Pro Bono'

export type PaymentStatus = 'Paid' | 'Refunded'

export interface PaymentRow {
  id: string
  rawId: string
  invoiceId: string
  invoiceRawId: string
  patientId: string
  patient: { name: string; initials: string; phone: string }
  service: string
  dentist: string
  date: string
  rawDate: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  invoiceBalance: number
  bankName: string | null
  referenceNumber: string | null
  proofPhotoUrl: string | null
  signature: SignatureValue | null
  signaturePrintedName: string | null
}

export function computePaymentsSummary(payments: PaymentRow[]) {
  const completed = payments.filter((p) => p.status === 'Paid')

  return {
    totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
    paidCount: completed.length,
    coverageAmount: completed
      .filter((p) => p.method === 'Sponsored' || p.method === 'Pro Bono')
      .reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments
      .filter((p) => p.status === 'Refunded')
      .reduce((sum, p) => sum + p.amount, 0),
  }
}
