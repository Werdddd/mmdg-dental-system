import {
  formatPatientCode,
  isMinor,
  type PatientRow,
  type PreferredContactMethod,
  type RecordStatus,
} from '@/components/patients/data'
import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate, formatMonthDay, initialsOf } from '@/lib/utils'
import {
  getPatientMedicalHistory,
  upsertPatientMedicalHistory,
  type MedicalHistoryInput,
} from '@/lib/data/patient-medical-history'
import {
  getPatientConsentForm,
  upsertPatientConsentForm,
  type ConsentFormInput,
} from '@/lib/data/patient-consent-forms'
import { getPatientRadiographConsent } from '@/lib/data/patient-radiograph-consents'
import {
  deletePatientPhoto,
  signPatientPhotoUrl,
  signPatientPhotoUrls,
  uploadPatientPhoto,
} from '@/lib/data/patient-photo'

interface ProfileNameRow {
  full_name: string | null
}

interface AppointmentRow {
  scheduled_at: string
  notes: string | null
}

interface PatientQueryRow {
  id: string
  patient_number: number
  clinic_id: string
  clinic: { name: string } | null
  full_name: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  suffix: string | null
  gender: 'Male' | 'Female' | null
  birthday: string | null
  address: string | null
  phone: string | null
  telephone_number: string | null
  preferred_contact_method: PreferredContactMethod | null
  occupation: string | null
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
  history_of_present_illness: string | null
  initial_clinical_findings: string | null
  diagnosis: string | null
  treatment_recommendations: string | null
  record_status: RecordStatus
  created_by: string | null
  updated_by: string | null
  updated_at: string
  photo_path: string | null
  recall_date: string | null
  recall_note: string | null
  created_by_profile: ProfileNameRow | null
  updated_by_profile: ProfileNameRow | null
  appointments: AppointmentRow[] | null
}

const SELECT = `
  id, patient_number, clinic_id, clinic:clinics ( name ),
  full_name, first_name, middle_name, last_name, suffix,
  gender, birthday, address, phone, telephone_number, preferred_contact_method, occupation,
  treatment_status, created_at,
  email, nationality, civil_status,
  emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
  chief_complaint, symptoms, affected_area, complaint_remarks,
  history_of_present_illness, initial_clinical_findings, diagnosis, treatment_recommendations,
  record_status, created_by, updated_by, updated_at, photo_path,
  recall_date, recall_note,
  created_by_profile:profiles!patients_created_by_fkey ( full_name ),
  updated_by_profile:profiles!patients_updated_by_fkey ( full_name ),
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

function summarizeAppointments(appointments: AppointmentRow[]) {
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
  )
  const latest = sorted[0]

  const now = Date.now()
  const past = sorted.filter((a) => new Date(a.scheduled_at).getTime() <= now)
  const future = sorted.filter((a) => new Date(a.scheduled_at).getTime() > now)
  const nextUpcoming = future[future.length - 1]

  return {
    latest,
    lastAppointmentDate: past[0]
      ? formatDisplayDate(past[0].scheduled_at.slice(0, 10))
      : '—',
    nextAppointmentDate: nextUpcoming
      ? formatDisplayDate(nextUpcoming.scheduled_at.slice(0, 10))
      : '—',
  }
}

function mapPatientRow(row: PatientQueryRow, photoUrl: string): PatientRow {
  const { latest, lastAppointmentDate, nextAppointmentDate } =
    summarizeAppointments(row.appointments ?? [])

  return {
    id: row.id,
    patientNumber: row.patient_number,
    clinicId: row.clinic_id,
    clinicName: row.clinic?.name ?? 'Unknown Clinic',
    name: row.full_name,
    initials: initialsOf(row.full_name),
    photoUrl,
    firstName: row.first_name ?? '',
    middleName: row.middle_name ?? '',
    lastName: row.last_name ?? '',
    suffix: row.suffix ?? '',
    age: row.birthday ? computeAge(row.birthday) : 0,
    gender: row.gender ?? 'Female',
    phone: row.phone ?? '',
    telephoneNumber: row.telephone_number ?? '',
    preferredContactMethod: row.preferred_contact_method ?? '',
    occupation: row.occupation ?? '',
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
    dentalVisit: {
      chiefComplaint: row.chief_complaint ?? '',
      symptoms: row.symptoms ?? '',
      affectedArea: row.affected_area ?? '',
      historyOfPresentIllness: row.history_of_present_illness ?? '',
      initialClinicalFindings: row.initial_clinical_findings ?? '',
      diagnosis: row.diagnosis ?? '',
      treatmentRecommendations: row.treatment_recommendations ?? '',
      remarks: row.complaint_remarks ?? '',
    },
    systemMetadata: {
      recordStatus: row.record_status,
      createdByName: row.created_by_profile?.full_name ?? '—',
      createdAt: formatDisplayDate(row.created_at.slice(0, 10)),
      updatedByName: row.updated_by_profile?.full_name ?? '—',
      updatedAt: formatDisplayDate(row.updated_at.slice(0, 10)),
      lastAppointmentDate,
      nextAppointmentDate,
      recallDate: row.recall_date ? formatDisplayDate(row.recall_date) : '—',
      recallNote: row.recall_note ?? '',
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
  const rows = (data ?? []) as unknown as PatientQueryRow[]
  const photoUrls = await signPatientPhotoUrls(
    supabase,
    rows.map((row) => row.photo_path),
  )
  return rows.map((row) =>
    mapPatientRow(
      row,
      row.photo_path ? (photoUrls.get(row.photo_path) ?? '') : '',
    ),
  )
}

export async function getPatientCount(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)

  if (error) throw error
  return count ?? 0
}

export interface PatientProfileInput {
  middleName?: string
  suffix?: string
  telephoneNumber?: string
  preferredContactMethod?: PreferredContactMethod
  occupation?: string
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
  historyOfPresentIllness?: string
  initialClinicalFindings?: string
  diagnosis?: string
  treatmentRecommendations?: string
  recordStatus?: RecordStatus
  medicalHistory?: MedicalHistoryInput
  consentForm?: ConsentFormInput
}

export interface NewPatientInput extends PatientProfileInput {
  firstName: string
  lastName: string
  phone: string
  gender: 'Male' | 'Female'
  birthday: string
  address: string
}

export interface UpdatePatientInput extends PatientProfileInput {
  firstName: string
  lastName: string
  phone: string
  gender: 'Male' | 'Female'
  birthday: string
  address: string
}

function profileColumns(input: PatientProfileInput) {
  return {
    middle_name: input.middleName || null,
    suffix: input.suffix || null,
    telephone_number: input.telephoneNumber || null,
    preferred_contact_method: input.preferredContactMethod || null,
    occupation: input.occupation || null,
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
    history_of_present_illness: input.historyOfPresentIllness || null,
    initial_clinical_findings: input.initialClinicalFindings || null,
    diagnosis: input.diagnosis || null,
    treatment_recommendations: input.treatmentRecommendations || null,
    record_status: input.recordStatus || 'Active',
  }
}

// Scoped by RLS only (no explicit clinic_id filter) — same cross-clinic
// pattern as searchPatients() below, so any authorized clinic-staff member
// can open a shared patient's chart regardless of which clinic it belongs
// to.
export async function getPatientById(
  supabase: SupabaseServerClient,
  patientId: string,
): Promise<PatientRow | null> {
  const { data, error } = await supabase
    .from('patients')
    .select(SELECT)
    .eq('id', patientId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  const row = data as unknown as PatientQueryRow
  const photoUrl = row.photo_path
    ? await signPatientPhotoUrl(supabase, row.photo_path)
    : ''
  return mapPatientRow(row, photoUrl)
}

// Uploads/removes the patient's profile photo (both optional) and returns
// the resulting storage path, or null if there is none. `currentPath` is
// the path already on the row before this call, if any.
async function resolvePatientPhotoPath(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  currentPath: string | null,
  photoFile: File | null | undefined,
  removePhoto: boolean | undefined,
): Promise<string | null> {
  if (photoFile) {
    if (currentPath) {
      await deletePatientPhoto(supabase, currentPath).catch(() => {})
    }
    const newPath = await uploadPatientPhoto(
      supabase,
      clinicId,
      patientId,
      photoFile,
    )
    const { error } = await supabase
      .from('patients')
      .update({ photo_path: newPath })
      .eq('id', patientId)
    if (error) throw error
    return newPath
  }

  if (removePhoto && currentPath) {
    await deletePatientPhoto(supabase, currentPath).catch(() => {})
    const { error } = await supabase
      .from('patients')
      .update({ photo_path: null })
      .eq('id', patientId)
    if (error) throw error
    return null
  }

  return currentPath
}

export async function createPatient(
  supabase: SupabaseServerClient,
  clinicId: string,
  profileId: string | undefined,
  input: NewPatientInput,
  photoFile?: File | null,
): Promise<PatientRow> {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      gender: input.gender,
      birthday: input.birthday,
      address: input.address,
      created_by: profileId ?? null,
      updated_by: profileId ?? null,
      ...profileColumns(input),
    })
    .select(SELECT)
    .single()

  if (error) throw error
  const row = data as unknown as PatientQueryRow
  const patient = mapPatientRow(row, '')

  if (input.medicalHistory) {
    await upsertPatientMedicalHistory(
      supabase,
      clinicId,
      patient.id,
      profileId,
      input.medicalHistory,
    )
  }
  if (input.consentForm) {
    await upsertPatientConsentForm(
      supabase,
      clinicId,
      patient.id,
      profileId,
      input.consentForm,
    )
  }

  const photoPath = await resolvePatientPhotoPath(
    supabase,
    clinicId,
    patient.id,
    row.photo_path,
    photoFile,
    false,
  )
  patient.photoUrl = photoPath
    ? await signPatientPhotoUrl(supabase, photoPath)
    : ''

  return patient
}

export async function updatePatient(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  profileId: string | undefined,
  input: UpdatePatientInput,
  photoFile?: File | null,
  removePhoto?: boolean,
): Promise<PatientRow> {
  const { data, error } = await supabase
    .from('patients')
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      gender: input.gender,
      birthday: input.birthday,
      address: input.address,
      updated_by: profileId ?? null,
      updated_at: new Date().toISOString(),
      ...profileColumns(input),
    })
    .eq('clinic_id', clinicId)
    .eq('id', patientId)
    .select(SELECT)
    .single()

  if (error) throw error
  const row = data as unknown as PatientQueryRow
  const patient = mapPatientRow(row, '')

  if (input.medicalHistory) {
    await upsertPatientMedicalHistory(
      supabase,
      clinicId,
      patient.id,
      profileId,
      input.medicalHistory,
    )
  }
  if (input.consentForm) {
    await upsertPatientConsentForm(
      supabase,
      clinicId,
      patient.id,
      profileId,
      input.consentForm,
    )
  }

  const photoPath = await resolvePatientPhotoPath(
    supabase,
    clinicId,
    patient.id,
    row.photo_path,
    photoFile,
    removePhoto,
  )
  patient.photoUrl = photoPath
    ? await signPatientPhotoUrl(supabase, photoPath)
    : ''

  return patient
}

// A lightweight follow-up flag — separate from booking an actual
// appointment — so front-desk staff can note when to reach back out to a
// patient (e.g. after a payment) without occupying a real time slot.
export async function setPatientRecall(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  profileId: string | undefined,
  recallDate: string | null,
  recallNote: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .update({
      recall_date: recallDate,
      recall_note: recallNote,
      updated_by: profileId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('clinic_id', clinicId)
    .eq('id', patientId)

  if (error) throw error
}

export async function getPatientIntakeExtras(
  supabase: SupabaseServerClient,
  patientId: string,
) {
  const [medicalHistory, consentForm, radiographConsent] = await Promise.all([
    getPatientMedicalHistory(supabase, patientId),
    getPatientConsentForm(supabase, patientId),
    getPatientRadiographConsent(supabase, patientId),
  ])
  return { medicalHistory, consentForm, radiographConsent }
}

export { isMinor }

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
