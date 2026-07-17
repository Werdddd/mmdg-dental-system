import {
  VALID_TRANSITIONS,
  type AppointmentRow,
  type AppointmentStatus,
} from '@/components/appointments/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, formatDisplayTime, initialsOf } from '@/lib/utils'
import { AppError } from '@/lib/errors'

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
  clinic_id: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  patient: { full_name: string; phone: string | null } | null
  dentist: { full_name: string | null; specialty: string | null } | null
  clinic: { name: string } | null
}

const SELECT = `
  id, patient_id, dentist_id, clinic_id, scheduled_at, status, notes,
  patient:patients ( full_name, phone ),
  dentist:profiles ( full_name, specialty ),
  clinic:clinics ( name )
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
    clinic: {
      id: row.clinic_id,
      name: row.clinic?.name ?? 'Unknown Clinic',
    },
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

// Cross-clinic read, relying on the "Clinic staff can view appointments in
// any clinic" RLS policy (migration 0018). Dentists rotate between MMDG's
// clinics, so staff need to see every clinic's bookings — not just the
// active one — to spot a dentist's schedule conflicts before they book.
export async function getAllAppointments(
  supabase: SupabaseServerClient,
): Promise<AppointmentRow[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(SELECT)
    .order('scheduled_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as AppointmentQueryRow[]).map(
    mapAppointmentRow,
  )
}

export async function getAppointmentCount(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)

  if (error) throw error
  return count ?? 0
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

export async function getUpcomingReminders(
  supabase: SupabaseServerClient,
  clinicId: string,
  daysAhead = 3,
): Promise<AppointmentRow[]> {
  const now = new Date()
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysAhead,
  ).toISOString()
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysAhead + 1,
  ).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startOfDay)
    .lt('scheduled_at', endOfDay)
    .not('status', 'in', '("Cancelled","Completed","No Show")')
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

  return (
    (data ?? []) as unknown as {
      id: string
      scheduled_at: string
      notes: string | null
      status: AppointmentStatus
      dentist: { full_name: string | null } | null
    }[]
  ).map((row) => ({
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

// Appointments in these statuses genuinely occupy the slot. Cancelled/No
// Show/Rescheduled appointments have freed it up for rebooking.
const BLOCKING_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'Scheduled',
  'In Progress',
  'Completed',
]

const DOUBLE_BOOKING_MESSAGE =
  'This dentist already has an appointment booked at that date and time.'

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  )
}

export async function createAppointment(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewAppointmentInput,
): Promise<AppointmentRow & { isFirstAppointment: boolean }> {
  const scheduledAt = new Date(`${input.date}T${input.time}`).toISOString()

  // Friendly pre-check. The unique partial index (migration 0023) is the
  // real guarantee against a race between two concurrent bookings for the
  // same slot — this just avoids a raw constraint-violation error in the
  // common case.
  const { data: conflicting, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('dentist_id', input.dentistId)
    .eq('scheduled_at', scheduledAt)
    .in('status', BLOCKING_APPOINTMENT_STATUSES)
    .limit(1)

  if (conflictError) throw conflictError
  if (conflicting && conflicting.length > 0) {
    throw new AppError(DOUBLE_BOOKING_MESSAGE)
  }

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

  if (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(DOUBLE_BOOKING_MESSAGE)
    }
    throw error
  }

  // Counted across all clinics (not just this one) since a patient's
  // appointment history is shared across MMDG's clinics — see
  // patients/appointments cross-clinic SELECT policy in migration 0018.
  const { count, error: countError } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', input.patientId)

  if (countError) throw countError

  return {
    ...mapAppointmentRow(data as unknown as AppointmentQueryRow),
    isFirstAppointment: (count ?? 0) <= 1,
  }
}

export async function updateAppointmentStatus(
  supabase: SupabaseServerClient,
  appointmentId: string,
  status: AppointmentStatus,
  notes?: string,
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError

  const currentStatus = current.status as AppointmentStatus
  if (
    currentStatus !== status &&
    !VALID_TRANSITIONS[currentStatus].includes(status)
  ) {
    throw new AppError(
      `An appointment can't move from "${currentStatus}" to "${status}".`,
    )
  }

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
