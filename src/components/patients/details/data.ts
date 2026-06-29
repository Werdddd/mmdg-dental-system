import { formatDisplayDate } from '@/lib/utils'
import type {
  PatientRow,
  EmergencyContact,
  ChiefComplaint,
} from '@/components/patients/data'

function hashSeed(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash || 1
}

export function formatPatientCode(id: string) {
  if (id.startsWith('pat-')) {
    const num = Number(id.replace('pat-', '')) || 0
    return `PT-${String(num).padStart(4, '0')}`
  }
  // UUID: derive a stable 4-digit number from the id hash
  const num = (hashSeed(id) % 9000) + 1000
  return `PT-${num}`
}

/* ---------- About / contact / emergency contact ---------- */

export type { EmergencyContact, ChiefComplaint }

export interface PatientAbout {
  dateOfBirth: string
  age: number
  gender: PatientRow['gender']
  nationality: string
  civilStatus: string
  contactNumber: string
  email: string
  emergencyContact: EmergencyContact
}

export interface PatientProfile {
  patientCode: string
  about: PatientAbout
  chiefComplaint: ChiefComplaint
}

function fallback(value: string) {
  return value.trim().length > 0 ? value : '—'
}

export function getPatientProfile(patient: PatientRow): PatientProfile {
  return {
    patientCode: formatPatientCode(patient.id),
    about: {
      dateOfBirth: patient.birthdayIso
        ? formatDisplayDate(patient.birthdayIso)
        : '—',
      age: patient.age,
      gender: patient.gender,
      nationality: fallback(patient.nationality),
      civilStatus: fallback(patient.civilStatus),
      contactNumber: fallback(patient.phone),
      email: fallback(patient.email),
      emergencyContact: {
        name: fallback(patient.emergencyContact.name),
        relation: fallback(patient.emergencyContact.relation),
        phone: fallback(patient.emergencyContact.phone),
      },
    },
    chiefComplaint: {
      primaryComplaint: fallback(patient.chiefComplaint.primaryComplaint),
      symptoms: fallback(patient.chiefComplaint.symptoms),
      affectedArea: fallback(patient.chiefComplaint.affectedArea),
      remarks: fallback(patient.chiefComplaint.remarks),
    },
  }
}
