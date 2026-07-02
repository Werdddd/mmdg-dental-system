export interface EmergencyContact {
  name: string
  relation: string
  phone: string
}

export interface ChiefComplaint {
  primaryComplaint: string
  symptoms: string
  affectedArea: string
  remarks: string
}

export function formatPatientCode(patientNumber: number) {
  return `P-${String(patientNumber).padStart(6, '0')}`
}

export interface PatientRow {
  id: string
  patientNumber: number
  name: string
  initials: string
  age: number
  gender: 'Male' | 'Female'
  phone: string
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
  chiefComplaint: ChiefComplaint
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
