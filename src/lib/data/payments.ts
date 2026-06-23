import type {
  PaymentMethod,
  PaymentRow,
  PaymentStatus,
} from '@/components/payments/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, initialsOf } from '@/lib/utils'

interface PaymentQueryRow {
  id: string
  payment_number: number
  treatment: string
  method: PaymentMethod
  amount: string | number
  status: PaymentStatus
  paid_at: string
  invoice_id: string | null
  patient: { full_name: string; phone: string | null } | null
  dentist: { full_name: string | null } | null
  invoice: { invoice_number: number } | null
}

const SELECT = `
  id, payment_number, treatment, method, amount, status, paid_at, invoice_id,
  patient:patients ( full_name, phone ),
  dentist:profiles ( full_name ),
  invoice:invoices ( invoice_number )
`

function mapPaymentRow(row: PaymentQueryRow): PaymentRow {
  return {
    id: `PAY-${row.payment_number}`,
    invoiceId: row.invoice ? `INV-${row.invoice.invoice_number}` : '—',
    patient: {
      name: row.patient?.full_name ?? 'Unknown Patient',
      initials: initialsOf(row.patient?.full_name ?? '??'),
      phone: row.patient?.phone ?? '',
    },
    service: row.treatment,
    dentist: row.dentist?.full_name ?? '—',
    date: formatDisplayDate(row.paid_at.slice(0, 10)),
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
  }
}

export async function getPayments(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .order('paid_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as PaymentQueryRow[]).map(mapPaymentRow)
}

export interface NewPaymentInput {
  patientId: string
  dentistId: string
  treatment: string
  date: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
}

export async function createPayment(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewPaymentInput,
): Promise<PaymentRow> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      clinic_id: clinicId,
      patient_id: input.patientId,
      dentist_id: input.dentistId,
      treatment: input.treatment,
      paid_at: new Date(input.date).toISOString(),
      amount: input.amount,
      method: input.method,
      status: input.status,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapPaymentRow(data as unknown as PaymentQueryRow)
}
