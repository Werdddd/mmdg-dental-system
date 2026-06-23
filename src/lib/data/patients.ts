import type { PatientRow } from '@/components/patients/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, formatMonthDay, initialsOf } from '@/lib/utils'

interface PatientQueryRow {
  id: string
  full_name: string
  gender: 'Male' | 'Female' | null
  birthday: string | null
  address: string | null
  phone: string | null
  treatment_status: 'Active' | 'Completed'
  created_at: string
  appointments: { scheduled_at: string; notes: string | null }[] | null
}

const SELECT = `
  id, full_name, gender, birthday, address, phone, treatment_status, created_at,
  appointments ( scheduled_at, notes )
`

function computeAge(birthday: string) {
  const dob = new Date(birthday)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const hadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())
  if (!hadBirthdayThisYear) age -= 1
  return age
}

function mapPatientRow(row: PatientQueryRow): PatientRow {
  const latest = [...(row.appointments ?? [])].sort(
    (a, b) =>
      new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
  )[0]

  return {
    id: row.id,
    name: row.full_name,
    initials: initialsOf(row.full_name),
    age: row.birthday ? computeAge(row.birthday) : 0,
    gender: row.gender ?? 'Female',
    phone: row.phone ?? '',
    lastAppointment: latest
      ? formatDisplayDate(latest.scheduled_at.slice(0, 10))
      : '—',
    lastAppointmentReason: latest?.notes || '—',
    address: row.address ?? '',
    registeredDate: formatDisplayDate(row.created_at.slice(0, 10)),
    treatmentStatus: row.treatment_status,
    birthday: row.birthday ? formatMonthDay(row.birthday) : '—',
  }
}

export async function getPatients(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<PatientRow[]> {
  const { data, error } = await supabase
    .from('patients')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as PatientQueryRow[]).map(mapPatientRow)
}

export interface NewPatientInput {
  fullName: string
  phone: string
  gender: 'Male' | 'Female'
  birthday: string
  address: string
}

export async function createPatient(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewPatientInput,
): Promise<PatientRow> {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      full_name: input.fullName,
      phone: input.phone,
      gender: input.gender,
      birthday: input.birthday,
      address: input.address,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapPatientRow(data as unknown as PatientQueryRow)
}
