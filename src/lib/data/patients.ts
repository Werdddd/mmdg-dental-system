import {
  formatPatientCode,
  type PatientRow,
  type PatientType,
} from '@/components/patients/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, formatMonthDay, initialsOf } from '@/lib/utils'

interface PatientQueryRow {
  id: string
  patient_number: number
  full_name: string
  gender: 'Male' | 'Female' | null
  birthday: string | null
  address: string | null
  phone: string | null
  treatment_status: 'Active' | 'Completed'
  created_at: string
  email: string | null
  nationality: string | null
  civil_status: string | null
  emergency_contact_name: string | null
  emergency_contact_relation: string | null
  emergency_contact_phone: string | null
  chief_complaint: string | null
  symptoms: string | null
  affected_area: string | null
  complaint_remarks: string | null
  patient_type: PatientType
  appointments: { scheduled_at: string; notes: string | null }[] | null
  patient_sponsorships:
    | {
        sponsor_id: string
        coverage_percentage: string | number
        coverage_cap: string | number | null
        valid_to: string | null
        sponsor: { name: string } | null
      }[]
    | null
}

const SELECT = `
  id, patient_number, full_name, gender, birthday, address, phone, treatment_status, created_at,
  email, nationality, civil_status,
  emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
  chief_complaint, symptoms, affected_area, complaint_remarks, patient_type,
  appointments ( scheduled_at, notes ),
  patient_sponsorships ( sponsor_id, coverage_percentage, coverage_cap, valid_to, sponsor:sponsors ( name ) )
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

  const activeSponsorship =
    (row.patient_sponsorships ?? []).find((s) => s.valid_to === null) ?? null

  return {
    patientType: row.patient_type,
    sponsorship: activeSponsorship
      ? {
          sponsorId: activeSponsorship.sponsor_id,
          sponsorName: activeSponsorship.sponsor?.name ?? 'Unknown Sponsor',
          coveragePercentage: Number(activeSponsorship.coverage_percentage),
          coverageCap:
            activeSponsorship.coverage_cap != null
              ? Number(activeSponsorship.coverage_cap)
              : null,
        }
      : null,
    id: row.id,
    patientNumber: row.patient_number,
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
    birthdayIso: row.birthday ?? '',
    email: row.email ?? '',
    nationality: row.nationality ?? '',
    civilStatus: row.civil_status ?? '',
    emergencyContact: {
      name: row.emergency_contact_name ?? '',
      relation: row.emergency_contact_relation ?? '',
      phone: row.emergency_contact_phone ?? '',
    },
    chiefComplaint: {
      primaryComplaint: row.chief_complaint ?? '',
      symptoms: row.symptoms ?? '',
      affectedArea: row.affected_area ?? '',
      remarks: row.complaint_remarks ?? '',
    },
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

export interface PatientProfileInput {
  email?: string
  nationality?: string
  civilStatus?: string
  emergencyContactName?: string
  emergencyContactRelation?: string
  emergencyContactPhone?: string
  chiefComplaint?: string
  symptoms?: string
  affectedArea?: string
  complaintRemarks?: string
}

export interface NewPatientInput extends PatientProfileInput {
  fullName: string
  phone: string
  gender: 'Male' | 'Female'
  birthday: string
  address: string
  patientType: PatientType
}

export interface UpdatePatientInput extends PatientProfileInput {
  fullName: string
  phone: string
  gender: 'Male' | 'Female'
  birthday: string
  address: string
  patientType: PatientType
}

function profileColumns(input: PatientProfileInput) {
  return {
    email: input.email || null,
    nationality: input.nationality || null,
    civil_status: input.civilStatus || null,
    emergency_contact_name: input.emergencyContactName || null,
    emergency_contact_relation: input.emergencyContactRelation || null,
    emergency_contact_phone: input.emergencyContactPhone || null,
    chief_complaint: input.chiefComplaint || null,
    symptoms: input.symptoms || null,
    affected_area: input.affectedArea || null,
    complaint_remarks: input.complaintRemarks || null,
  }
}

export async function getPatientById(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<PatientRow | null> {
  const { data, error } = await supabase
    .from('patients')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('id', patientId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return mapPatientRow(data as unknown as PatientQueryRow)
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
      patient_type: input.patientType,
      ...profileColumns(input),
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapPatientRow(data as unknown as PatientQueryRow)
}

export async function updatePatient(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  input: UpdatePatientInput,
): Promise<PatientRow> {
  const { data, error } = await supabase
    .from('patients')
    .update({
      full_name: input.fullName,
      phone: input.phone,
      gender: input.gender,
      birthday: input.birthday,
      address: input.address,
      patient_type: input.patientType,
      ...profileColumns(input),
    })
    .eq('clinic_id', clinicId)
    .eq('id', patientId)
    .select(SELECT)
    .single()

  if (error) throw error
  return mapPatientRow(data as unknown as PatientQueryRow)
}

export interface PatientSearchResult {
  id: string
  patientCode: string
  name: string
  initials: string
  clinicId: string
  clinicName: string
}

interface PatientSearchQueryRow {
  id: string
  patient_number: number
  full_name: string
  clinic: { id: string; name: string } | null
}

const SEARCH_SELECT =
  'id, patient_number, full_name, clinic:clinics ( id, name )'
const SEARCH_RESULT_LIMIT = 8

// Accepts "P-000123", "p123", or a bare "123" and recovers the underlying
// patient_number so the search bar can match a pasted/typed patient code.
function parsePatientNumberQuery(query: string): number | null {
  const match = query.match(/^p-?0*(\d+)$/i) ?? query.match(/^0*(\d+)$/)
  if (!match) return null
  const num = Number(match[1])
  return Number.isFinite(num) ? num : null
}

function mapSearchRow(row: PatientSearchQueryRow): PatientSearchResult {
  return {
    id: row.id,
    patientCode: formatPatientCode(row.patient_number),
    name: row.full_name,
    initials: initialsOf(row.full_name),
    clinicId: row.clinic?.id ?? '',
    clinicName: row.clinic?.name ?? 'Unknown Clinic',
  }
}

// Scoped by RLS only (no explicit clinic_id filter): superadmins match
// patients across every clinic so they can jump straight to the right one;
// admins/dentists are already restricted to their own clinic by policy.
export async function searchPatients(
  supabase: SupabaseServerClient,
  query: string,
): Promise<PatientSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const patientNumber = parsePatientNumberQuery(trimmed)

  const [byNumber, byName] = await Promise.all([
    patientNumber === null
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('patients')
          .select(SEARCH_SELECT)
          .eq('patient_number', patientNumber)
          .limit(1),
    supabase
      .from('patients')
      .select(SEARCH_SELECT)
      .ilike('full_name', `%${trimmed}%`)
      .order('full_name', { ascending: true })
      .limit(SEARCH_RESULT_LIMIT),
  ])

  if (byNumber.error) throw byNumber.error
  if (byName.error) throw byName.error

  const rows = [
    ...((byNumber.data ?? []) as unknown as PatientSearchQueryRow[]),
    ...((byName.data ?? []) as unknown as PatientSearchQueryRow[]),
  ]

  const seen = new Set<string>()
  const deduped = rows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })

  return deduped.slice(0, SEARCH_RESULT_LIMIT).map(mapSearchRow)
}
