import { formatDisplayDate } from '@/lib/utils'
import {
  formatPatientCode,
  type PatientRow,
  type EmergencyContact,
  type ChiefComplaint,
} from '@/components/patients/data'

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
    patientCode: formatPatientCode(patient.patientNumber),
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
