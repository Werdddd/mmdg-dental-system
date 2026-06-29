import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate } from '@/lib/utils'

export interface SponsorRow {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  defaultCoveragePercentage: number
  notes: string
  patientsCovered: number
  createdAt: string
}

interface SponsorQueryRow {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  default_coverage_percentage: string | number
  notes: string | null
  created_at: string
  patient_sponsorships: { valid_to: string | null }[] | null
}

const SELECT = `
  id, name, contact_person, phone, email, default_coverage_percentage, notes, created_at,
  patient_sponsorships ( valid_to )
`

function mapSponsorRow(row: SponsorQueryRow): SponsorRow {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    defaultCoveragePercentage: Number(row.default_coverage_percentage),
    notes: row.notes ?? '',
    patientsCovered: (row.patient_sponsorships ?? []).filter(
      (s) => s.valid_to === null,
    ).length,
    createdAt: formatDisplayDate(row.created_at.slice(0, 10)),
  }
}

export async function getSponsors(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<SponsorRow[]> {
  const { data, error } = await supabase
    .from('sponsors')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .order('name')

  if (error) throw error
  return ((data ?? []) as unknown as SponsorQueryRow[]).map(mapSponsorRow)
}

export interface SponsorInput {
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  defaultCoveragePercentage: number
  notes?: string
}

function sponsorColumns(input: SponsorInput) {
  return {
    name: input.name,
    contact_person: input.contactPerson?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    default_coverage_percentage: input.defaultCoveragePercentage,
    notes: input.notes?.trim() || null,
  }
}

export async function createSponsor(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: SponsorInput,
): Promise<SponsorRow> {
  const { data, error } = await supabase
    .from('sponsors')
    .insert({ clinic_id: clinicId, ...sponsorColumns(input) })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapSponsorRow(data as unknown as SponsorQueryRow)
}

export async function updateSponsor(
  supabase: SupabaseServerClient,
  clinicId: string,
  sponsorId: string,
  input: SponsorInput,
): Promise<SponsorRow> {
  const { data, error } = await supabase
    .from('sponsors')
    .update(sponsorColumns(input))
    .eq('clinic_id', clinicId)
    .eq('id', sponsorId)
    .select(SELECT)
    .single()

  if (error) throw error
  return mapSponsorRow(data as unknown as SponsorQueryRow)
}

export interface PatientSponsorshipRow {
  id: string
  sponsorId: string
  sponsorName: string
  coveragePercentage: number
  coverageCap: number | null
}

interface PatientSponsorshipQueryRow {
  id: string
  sponsor_id: string
  coverage_percentage: string | number
  coverage_cap: string | number | null
  sponsor: { name: string } | null
}

export async function getActiveSponsorshipForPatient(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<PatientSponsorshipRow | null> {
  const { data, error } = await supabase
    .from('patient_sponsorships')
    .select(
      'id, sponsor_id, coverage_percentage, coverage_cap, sponsor:sponsors ( name )',
    )
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .is('valid_to', null)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as unknown as PatientSponsorshipQueryRow

  return {
    id: row.id,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor?.name ?? 'Unknown Sponsor',
    coveragePercentage: Number(row.coverage_percentage),
    coverageCap: row.coverage_cap != null ? Number(row.coverage_cap) : null,
  }
}

export interface SetPatientSponsorshipInput {
  sponsorId: string
  coveragePercentage: number
  coverageCap?: number | null
}

export async function setPatientSponsorship(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  input: SetPatientSponsorshipInput,
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from('patient_sponsorships')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .is('valid_to', null)
    .maybeSingle()

  if (selectError) throw selectError

  const columns = {
    sponsor_id: input.sponsorId,
    coverage_percentage: input.coveragePercentage,
    coverage_cap: input.coverageCap ?? null,
  }

  if (existing) {
    const { error } = await supabase
      .from('patient_sponsorships')
      .update(columns)
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('patient_sponsorships')
    .insert({ clinic_id: clinicId, patient_id: patientId, ...columns })
  if (error) throw error
}

export async function clearPatientSponsorship(
  supabase: SupabaseServerClient,
  patientId: string,
): Promise<void> {
  const { error } = await supabase
    .from('patient_sponsorships')
    .update({ valid_to: new Date().toISOString().slice(0, 10) })
    .eq('patient_id', patientId)
    .is('valid_to', null)

  if (error) throw error
}
