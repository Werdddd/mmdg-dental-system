import { formatDisplayDate } from '@/lib/utils'
import {
  formatPatientCode,
  type PatientRow,
  type EmergencyContact,
  type DentalVisitInfo,
  type RecordStatus,
  type SystemMetadata,
} from '@/components/patients/data'

/* ---------- About / contact / emergency contact ---------- */

export type { EmergencyContact, DentalVisitInfo, RecordStatus, SystemMetadata }

export interface PatientAbout {
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  dateOfBirth: string
  age: number
  gender: PatientRow['gender']
  civilStatus: string
  nationality: string
  occupation: string
  homeAddress: string
  contactNumber: string
  telephoneNumber: string
  preferredContactMethod: string
  email: string
  emergencyContact: EmergencyContact
}

export interface PatientProfile {
  patientCode: string
  about: PatientAbout
  dentalVisit: DentalVisitInfo
  systemMetadata: SystemMetadata
}

function fallback(value: string) {
  return value.trim().length > 0 ? value : '—'
}

export function getPatientProfile(patient: PatientRow): PatientProfile {
  return {
    patientCode: formatPatientCode(patient.patientNumber),
    about: {
      firstName: fallback(patient.firstName),
      middleName: fallback(patient.middleName),
      lastName: fallback(patient.lastName),
      suffix: fallback(patient.suffix),
      dateOfBirth: patient.birthdayIso
        ? formatDisplayDate(patient.birthdayIso)
        : '—',
      age: patient.age,
      gender: patient.gender,
      civilStatus: fallback(patient.civilStatus),
      nationality: fallback(patient.nationality),
      occupation: fallback(patient.occupation),
      homeAddress: fallback(patient.address),
      contactNumber: fallback(patient.phone),
      telephoneNumber: fallback(patient.telephoneNumber),
      preferredContactMethod: fallback(patient.preferredContactMethod),
      email: fallback(patient.email),
      emergencyContact: {
        name: fallback(patient.emergencyContact.name),
        relation: fallback(patient.emergencyContact.relation),
        phone: fallback(patient.emergencyContact.phone),
      },
    },
    dentalVisit: {
      chiefComplaint: fallback(patient.dentalVisit.chiefComplaint),
      symptoms: fallback(patient.dentalVisit.symptoms),
      affectedArea: fallback(patient.dentalVisit.affectedArea),
      historyOfPresentIllness: fallback(
        patient.dentalVisit.historyOfPresentIllness,
      ),
      initialClinicalFindings: fallback(
        patient.dentalVisit.initialClinicalFindings,
      ),
      diagnosis: fallback(patient.dentalVisit.diagnosis),
      treatmentRecommendations: fallback(
        patient.dentalVisit.treatmentRecommendations,
      ),
      remarks: fallback(patient.dentalVisit.remarks),
    },
    systemMetadata: patient.systemMetadata,
  }
}
