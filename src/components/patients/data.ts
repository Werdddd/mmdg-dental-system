export interface EmergencyContact {
  name: string
  relation: string
  phone: string
}

export interface DentalVisitInfo {
  chiefComplaint: string
  symptoms: string
  affectedArea: string
  historyOfPresentIllness: string
  initialClinicalFindings: string
  diagnosis: string
  treatmentRecommendations: string
  remarks: string
}

export type RecordStatus = 'Active' | 'Inactive' | 'Archived'

export type PreferredContactMethod =
  | 'SMS'
  | 'Phone Call'
  | 'Email'
  | 'Facebook Messenger'
  | 'WhatsApp'
  | 'Viber'
  | 'Other'

export interface SystemMetadata {
  recordStatus: RecordStatus
  createdByName: string
  createdAt: string
  updatedByName: string
  updatedAt: string
  lastAppointmentDate: string
  nextAppointmentDate: string
}

export function formatPatientCode(patientNumber: number) {
  return `P-${String(patientNumber).padStart(6, '0')}`
}

export interface PatientRow {
  id: string
  patientNumber: number
  name: string
  initials: string
  photoUrl: string
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  age: number
  gender: 'Male' | 'Female'
  phone: string
  telephoneNumber: string
  preferredContactMethod: PreferredContactMethod | ''
  occupation: string
  lastAppointment: string
  lastAppointmentReason: string
  address: string
  registeredDate: string
  treatmentStatus: 'Active' | 'Completed'
  birthday: string
  birthdayIso: string
  email: string
  nationality: string
  civilStatus: string
  emergencyContact: EmergencyContact
  dentalVisit: DentalVisitInfo
  systemMetadata: SystemMetadata
}

function isThisMonth(dateStr: string, referenceDate: Date) {
  const parsed = new Date(dateStr)
  return (
    parsed.getMonth() === referenceDate.getMonth() &&
    parsed.getFullYear() === referenceDate.getFullYear()
  )
}

function isWithinNextDays(monthDay: string, days: number, referenceDate: Date) {
  const parsed = new Date(`${monthDay}, ${referenceDate.getFullYear()}`)
  if (parsed < referenceDate) {
    parsed.setFullYear(parsed.getFullYear() + 1)
  }
  const diffDays =
    (parsed.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

export function computePatientsSummary(patients: PatientRow[]) {
  const referenceDate = new Date()

  return {
    totalPatients: patients.length,
    newThisMonth: patients.filter((p) =>
      isThisMonth(p.registeredDate, referenceDate),
    ).length,
    activeTreatments: patients.filter((p) => p.treatmentStatus === 'Active')
      .length,
    upcomingBirthdays: patients.filter((p) =>
      isWithinNextDays(p.birthday, 30, referenceDate),
    ).length,
  }
}

// Patient is a minor if under 18 as of today — drives the Guardian fields
// on the Consent & Waiver Form.
export function isMinor(birthdayIso: string): boolean {
  if (!birthdayIso) return false
  const dob = new Date(birthdayIso)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const hadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())
  if (!hadBirthdayThisYear) age -= 1
  return age < 18
}
