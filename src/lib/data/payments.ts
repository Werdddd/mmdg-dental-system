import { randomUUID } from 'crypto'

import type {
  PaymentMethod,
  PaymentRow,
  PaymentStatus,
} from '@/components/payments/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, initialsOf } from '@/lib/utils'

const PROOF_BUCKET = 'payment-proofs'
const SIGNED_URL_TTL_SECONDS = 60 * 60

interface PaymentQueryRow {
  id: string
  payment_number: number
  method: PaymentMethod
  amount: string | number
  status: PaymentStatus
  paid_at: string
  invoice_id: string
  patient_id: string
  bank_name: string | null
  reference_number: string | null
  proof_photo_path: string | null
  patient: { full_name: string; phone: string | null } | null
  invoice: {
    invoice_number: number
    balance: string | number
    invoice_items: {
      description: string
      treatment_record: { dentist: { full_name: string | null } | null } | null
    }[]
  } | null
}

const SELECT = `
  id, payment_number, method, amount, status, paid_at, invoice_id, patient_id,
  bank_name, reference_number, proof_photo_path,
  patient:patients ( full_name, phone ),
  invoice:invoices (
    invoice_number, balance,
    invoice_items ( description, treatment_record:treatment_records ( dentist:profiles ( full_name ) ) )
  )
`

function mapPaymentRow(
  row: PaymentQueryRow,
  proofPhotoUrl: string | null,
): PaymentRow {
  const items = row.invoice?.invoice_items ?? []
  const service =
    items.length === 0
      ? '—'
      : items.length === 1
        ? items[0].description
        : `${items[0].description} +${items.length - 1} more`

  const dentistNames = Array.from(
    new Set(
      items
        .map((item) => item.treatment_record?.dentist?.full_name)
        .filter((name): name is string => Boolean(name)),
    ),
  )
  const dentist =
    dentistNames.length === 0
      ? '—'
      : dentistNames.length === 1
        ? dentistNames[0]
        : 'Multiple'

  return {
    id: `PAY-${row.payment_number}`,
    invoiceId: row.invoice ? `INV-${row.invoice.invoice_number}` : '—',
    invoiceRawId: row.invoice_id,
    patientId: row.patient_id,
    patient: {
      name: row.patient?.full_name ?? 'Unknown Patient',
      initials: initialsOf(row.patient?.full_name ?? '??'),
      phone: row.patient?.phone ?? '',
    },
    service,
    dentist,
    date: formatDisplayDate(row.paid_at.slice(0, 10)),
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    invoiceBalance: row.invoice ? Number(row.invoice.balance) : 0,
    bankName: row.bank_name,
    referenceNumber: row.reference_number,
    proofPhotoUrl,
  }
}

async function mapPaymentRows(
  supabase: SupabaseServerClient,
  rows: PaymentQueryRow[],
): Promise<PaymentRow[]> {
  const pathsToSign = rows
    .map((row) => row.proof_photo_path)
    .filter((path): path is string => Boolean(path))

  const signedUrlByPath = new Map<string, string>()
  if (pathsToSign.length > 0) {
    const { data: signed, error } = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrls(pathsToSign, SIGNED_URL_TTL_SECONDS)
    if (error) throw error
    signed?.forEach((s, i) => {
      if (s.signedUrl) signedUrlByPath.set(pathsToSign[i], s.signedUrl)
    })
  }

  return rows.map((row) =>
    mapPaymentRow(
      row,
      row.proof_photo_path
        ? (signedUrlByPath.get(row.proof_photo_path) ?? null)
        : null,
    ),
  )
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
  return mapPaymentRows(supabase, (data ?? []) as unknown as PaymentQueryRow[])
}

export async function getPaymentsForPatient(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('paid_at', { ascending: false })

  if (error) throw error
  return mapPaymentRows(supabase, (data ?? []) as unknown as PaymentQueryRow[])
}

export async function getRevenueByClinic(
  supabase: SupabaseServerClient,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('payments')
    .select('clinic_id, amount')
    .eq('status', 'Paid')

  if (error) throw error

  const totals: Record<string, number> = {}
  for (const row of data ?? []) {
    totals[row.clinic_id] = (totals[row.clinic_id] ?? 0) + Number(row.amount)
  }
  return totals
}

export interface NewPaymentInput {
  invoiceId: string
  amount: number
  method: PaymentMethod
  date: string
  bankName?: string | null
  referenceNumber?: string | null
  proofPhotoPath?: string | null
}

export async function recordPayment(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewPaymentInput,
): Promise<PaymentRow> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, patient_id, balance')
    .eq('clinic_id', clinicId)
    .eq('id', input.invoiceId)
    .single()

  if (invoiceError) throw invoiceError

  if (input.amount <= 0) {
    throw new Error('Payment amount must be greater than zero.')
  }
  if (input.amount > Number(invoice.balance)) {
    throw new Error('Payment amount exceeds the remaining balance.')
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      clinic_id: clinicId,
      invoice_id: invoice.id,
      patient_id: invoice.patient_id,
      amount: input.amount,
      method: input.method,
      paid_at: new Date(input.date).toISOString(),
      bank_name: input.method === 'Bank' ? input.bankName?.trim() || null : null,
      reference_number:
        input.method === 'Bank' || input.method === 'GCash'
          ? input.referenceNumber?.trim() || null
          : null,
      proof_photo_path: input.proofPhotoPath ?? null,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return (
    await mapPaymentRows(supabase, [data as unknown as PaymentQueryRow])
  )[0]
}

function sanitizeExtension(filename: string) {
  const ext = filename.split('.').pop() ?? ''
  const cleaned = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return cleaned.slice(0, 8) || 'jpg'
}

export async function uploadPaymentProof(
  supabase: SupabaseServerClient,
  clinicId: string,
  file: File,
): Promise<string> {
  const path = `${clinicId}/${randomUUID()}.${sanitizeExtension(file.name)}`

  const { error } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, file, { contentType: file.type })
  if (error) throw error

  return path
}
