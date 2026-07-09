import type { InvoiceRow, InvoiceStatus } from '@/components/invoices/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, initialsOf } from '@/lib/utils'
import { AppError } from '@/lib/errors'

interface InvoiceQueryRow {
  id: string
  invoice_number: number
  patient_id: string
  due_date: string | null
  subtotal: string | number
  total: string | number
  balance: string | number
  status: InvoiceStatus
  created_at: string
  patient: { full_name: string; phone: string | null } | null
  invoice_items: {
    id: string
    treatment_record_id: string
    description: string
    quantity: number
    unit_price: string | number
    amount: string | number
  }[]
}

const SELECT = `
  id, invoice_number, patient_id, due_date, subtotal, total, balance, status, created_at,
  patient:patients ( full_name, phone ),
  invoice_items ( id, treatment_record_id, description, quantity, unit_price, amount )
`

function mapInvoiceRow(row: InvoiceQueryRow): InvoiceRow {
  return {
    rawId: row.id,
    id: `INV-${row.invoice_number}`,
    patientId: row.patient_id,
    patient: {
      name: row.patient?.full_name ?? 'Unknown Patient',
      initials: initialsOf(row.patient?.full_name ?? '??'),
      phone: row.patient?.phone ?? '',
    },
    items: (row.invoice_items ?? []).map((item) => ({
      id: item.id,
      treatmentRecordId: item.treatment_record_id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      amount: Number(item.amount),
    })),
    createdDate: formatDisplayDate(row.created_at.slice(0, 10)),
    dueDate: row.due_date ? formatDisplayDate(row.due_date) : '—',
    subtotal: Number(row.subtotal),
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

export async function getInvoicesWithBalance(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<InvoiceRow[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .gt('balance', 0)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as InvoiceQueryRow[]).map(mapInvoiceRow)
}

export interface GenerateInvoiceInput {
  patientId: string
  treatmentRecordIds: string[]
  dueDate: string
}

export async function generateInvoice(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: GenerateInvoiceInput,
): Promise<InvoiceRow> {
  if (input.treatmentRecordIds.length === 0) {
    throw new AppError('Select at least one treatment to invoice.')
  }

  // Runs as a single DB transaction (see migration 0024) so a failure
  // partway through can't leave a $0 invoice with no line items behind.
  const { data: invoiceId, error: rpcError } = await supabase.rpc(
    'generate_invoice',
    {
      p_clinic_id: clinicId,
      p_patient_id: input.patientId,
      p_treatment_record_ids: input.treatmentRecordIds,
      p_due_date: input.dueDate,
    },
  )

  if (rpcError) {
    // P0001 = the plain `raise exception '...'` messages the function
    // raises itself — those are safe, intentional, user-facing text.
    // Anything else is an unexpected DB error.
    if (rpcError.code === 'P0001') {
      throw new AppError(rpcError.message)
    }
    throw rpcError
  }

  const { data, error } = await supabase
    .from('invoices')
    .select(SELECT)
    .eq('id', invoiceId)
    .single()

  if (error) throw error
  return mapInvoiceRow(data as unknown as InvoiceQueryRow)
}
