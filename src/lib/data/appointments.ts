import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, formatDisplayTime, initialsOf } from '@/lib/utils'

export interface PatientAppointmentData {
  id: string
  scheduledAt: string
  notes: string | null
  status: AppointmentStatus
  dentistName: string
}

interface AppointmentQueryRow {
  id: string
  patient_id: string
  dentist_id: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  patient: { full_name: string; phone: string | null } | null
  dentist: { full_name: string | null; specialty: string | null } | null
}

const SELECT = `
  id, patient_id, dentist_id, scheduled_at, status, notes,
  patient:patients ( full_name, phone ),
  dentist:profiles ( full_name, specialty )
`

function mapAppointmentRow(row: AppointmentQueryRow): AppointmentRow {
  const scheduled = new Date(row.scheduled_at)
  const hh = String(scheduled.getHours()).padStart(2, '0')
  const mm = String(scheduled.getMinutes()).padStart(2, '0')

  return {
    id: row.id,
    scheduledAt: row.scheduled_at,
    date: formatDisplayDate(row.scheduled_at.slice(0, 10)),
    time: formatDisplayTime(`${hh}:${mm}`),
    patient: {
      id: row.patient_id,
      name: row.patient?.full_name ?? 'Unknown Patient',
      initials: initialsOf(row.patient?.full_name ?? '??'),
      phone: row.patient?.phone ?? '',
    },
    dentist: {
      id: row.dentist_id,
      name: row.dentist?.full_name ?? 'Unassigned',
      initials: initialsOf(row.dentist?.full_name ?? '??'),
      specialty: row.dentist?.specialty ?? 'General Dentist',
    },
    notes: row.notes ?? '',
    status: row.status,
  }
}

export async function getAppointments(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<AppointmentRow[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .order('scheduled_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as AppointmentQueryRow[]).map(
    mapAppointmentRow,
  )
}

export async function getTodayAppointments(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<AppointmentRow[]> {
  const now = new Date()
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString()
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startOfDay)
    .lt('scheduled_at', endOfDay)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return ((data ?? []) as unknown as AppointmentQueryRow[]).map(
    mapAppointmentRow,
  )
}

export async function getPatientAppointments(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<PatientAppointmentData[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, notes, status, dentist:profiles ( full_name )')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as unknown as {
    id: string
    scheduled_at: string
    notes: string | null
    status: AppointmentStatus
    dentist: { full_name: string | null } | null
  }[]).map((row) => ({
    id: row.id,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
    status: row.status,
    dentistName: row.dentist?.full_name ?? 'Unassigned',
  }))
}

export interface NewAppointmentInput {
  patientId: string
  dentistId: string
  date: string
  time: string
  status: AppointmentStatus
  notes: string // treatment plan / treatment done
}

export async function createAppointment(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewAppointmentInput,
): Promise<AppointmentRow> {
  const scheduledAt = new Date(`${input.date}T${input.time}`).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      patient_id: input.patientId,
      dentist_id: input.dentistId,
      scheduled_at: scheduledAt,
      mode: 'In-person', // kept in DB but hidden from UI
      status: input.status,
      notes: input.notes || null,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapAppointmentRow(data as unknown as AppointmentQueryRow)
}

export async function updateAppointmentStatus(
  supabase: SupabaseServerClient,
  appointmentId: string,
  status: AppointmentStatus,
  notes?: string,
): Promise<void> {
  const updateData: Record<string, unknown> = { status }
  if (notes !== undefined) {
    updateData.notes = notes || null
  }

  const { error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)

  if (error) throw error
}
