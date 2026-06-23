import {
  TAX_RATE,
  type InvoiceRow,
  type InvoiceStatus,
} from '@/components/invoices/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, initialsOf } from '@/lib/utils'

interface InvoiceQueryRow {
  id: string
  invoice_number: number
  treatment: string
  due_date: string | null
  subtotal: string | number
  tax: string | number
  total: string | number
  balance: string | number
  status: InvoiceStatus
  created_at: string
  patient: { full_name: string; phone: string | null } | null
}

const SELECT = `
  id, invoice_number, treatment, due_date, subtotal, tax, total, balance, status, created_at,
  patient:patients ( full_name, phone )
`

function mapInvoiceRow(row: InvoiceQueryRow): InvoiceRow {
  return {
    id: `INV-${row.invoice_number}`,
    patient: {
      name: row.patient?.full_name ?? 'Unknown Patient',
      initials: initialsOf(row.patient?.full_name ?? '??'),
      phone: row.patient?.phone ?? '',
    },
    treatment: row.treatment,
    createdDate: formatDisplayDate(row.created_at.slice(0, 10)),
    dueDate: row.due_date ? formatDisplayDate(row.due_date) : '—',
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    balance: Number(row.balance),
    status: row.status,
  }
}

export async function getInvoices(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<InvoiceRow[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as InvoiceQueryRow[]).map(mapInvoiceRow)
}

export interface NewInvoiceInput {
  patientId: string
  treatment: string
  dueDate: string
  subtotal: number
  status: InvoiceStatus
}

export async function createInvoice(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewInvoiceInput,
): Promise<InvoiceRow> {
  const tax = Math.round(input.subtotal * TAX_RATE)
  const total = input.subtotal + tax
  const balance = input.status === 'Paid' ? 0 : total

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      clinic_id: clinicId,
      patient_id: input.patientId,
      treatment: input.treatment,
      due_date: input.dueDate,
      subtotal: input.subtotal,
      tax,
      total,
      balance,
      status: input.status,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapInvoiceRow(data as unknown as InvoiceQueryRow)
}
