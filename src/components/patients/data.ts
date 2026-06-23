import { MOCK_TODAY } from '@/lib/utils'

export interface PatientRow {
  id: string
  name: string
  initials: string
  age: number
  gender: 'Male' | 'Female'
  lastAppointment: string
  lastAppointmentReason: string
  address: string
  registeredDate: string
  treatmentStatus: 'Active' | 'Completed'
  birthday: string
}

export const PATIENTS: PatientRow[] = [
  {
    id: 'pat-1',
    name: 'Maria Santos',
    initials: 'MS',
    age: 34,
    gender: 'Female',
    lastAppointment: 'Jun 21, 2026',
    lastAppointmentReason: 'Routine Cleaning',
    address: 'Quezon City, Metro Manila',
    registeredDate: 'Mar 12, 2025',
    treatmentStatus: 'Completed',
    birthday: 'Jul 2',
  },
  {
    id: 'pat-2',
    name: 'James Cruz',
    initials: 'JC',
    age: 41,
    gender: 'Male',
    lastAppointment: 'Jun 21, 2026',
    lastAppointmentReason: 'Root Canal Follow-up',
    address: 'Makati City, Metro Manila',
    registeredDate: 'Jun 10, 2026',
    treatmentStatus: 'Active',
    birthday: 'Nov 14',
  },
  {
    id: 'pat-3',
    name: 'Liza Fernandez',
    initials: 'LF',
    age: 29,
    gender: 'Female',
    lastAppointment: 'Jun 21, 2026',
    lastAppointmentReason: 'Tooth Extraction',
    address: 'Pasig City, Metro Manila',
    registeredDate: 'Jan 22, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Jun 25',
  },
  {
    id: 'pat-4',
    name: 'Noah Bautista',
    initials: 'NB',
    age: 8,
    gender: 'Male',
    lastAppointment: 'Jun 22, 2026',
    lastAppointmentReason: 'Dental Checkup',
    address: 'Taguig City, Metro Manila',
    registeredDate: 'Jun 18, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Dec 3',
  },
  {
    id: 'pat-5',
    name: 'Ana Lim',
    initials: 'AL',
    age: 19,
    gender: 'Female',
    lastAppointment: 'Jun 22, 2026',
    lastAppointmentReason: 'Braces Adjustment',
    address: 'Mandaluyong City, Metro Manila',
    registeredDate: 'Feb 14, 2026',
    treatmentStatus: 'Active',
    birthday: 'Jul 10',
  },
  {
    id: 'pat-6',
    name: 'Mark Tan',
    initials: 'MT',
    age: 52,
    gender: 'Male',
    lastAppointment: 'Jun 23, 2026',
    lastAppointmentReason: 'Consultation',
    address: 'Manila, Metro Manila',
    registeredDate: 'May 30, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Sep 19',
  },
  {
    id: 'pat-7',
    name: 'Carla Reyes',
    initials: 'CR',
    age: 27,
    gender: 'Female',
    lastAppointment: 'Jun 23, 2026',
    lastAppointmentReason: 'Teeth Whitening',
    address: 'San Juan City, Metro Manila',
    registeredDate: 'Apr 2, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Aug 1',
  },
  {
    id: 'pat-8',
    name: 'Paolo Mendoza',
    initials: 'PM',
    age: 45,
    gender: 'Male',
    lastAppointment: 'Jun 24, 2026',
    lastAppointmentReason: 'Dental Implant Review',
    address: 'Cebu City, Cebu',
    registeredDate: 'Jun 3, 2026',
    treatmentStatus: 'Active',
    birthday: 'Jun 30',
  },
  {
    id: 'pat-9',
    name: 'Grace Villanueva',
    initials: 'GV',
    age: 36,
    gender: 'Female',
    lastAppointment: 'Jun 24, 2026',
    lastAppointmentReason: 'Routine Cleaning',
    address: 'Davao City, Davao del Sur',
    registeredDate: 'Mar 19, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Oct 5',
  },
  {
    id: 'pat-10',
    name: 'Diego Ramos',
    initials: 'DR',
    age: 31,
    gender: 'Male',
    lastAppointment: 'Jun 24, 2026',
    lastAppointmentReason: 'Cavity Filling',
    address: 'Pasay City, Metro Manila',
    registeredDate: 'Jun 15, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Jan 9',
  },
  {
    id: 'pat-11',
    name: 'Sofia Garcia',
    initials: 'SG',
    age: 6,
    gender: 'Female',
    lastAppointment: 'Jun 25, 2026',
    lastAppointmentReason: 'Pediatric Checkup',
    address: 'Antipolo City, Rizal',
    registeredDate: 'Feb 27, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Sep 12',
  },
  {
    id: 'pat-12',
    name: 'Miguel Torres',
    initials: 'MT',
    age: 58,
    gender: 'Male',
    lastAppointment: 'Jun 25, 2026',
    lastAppointmentReason: 'Gum Treatment',
    address: 'Quezon City, Metro Manila',
    registeredDate: 'May 11, 2026',
    treatmentStatus: 'Active',
    birthday: 'Mar 22',
  },
  {
    id: 'pat-13',
    name: 'Isabel Cruz',
    initials: 'IC',
    age: 23,
    gender: 'Female',
    lastAppointment: 'Jun 25, 2026',
    lastAppointmentReason: 'Wisdom Tooth Consultation',
    address: 'Makati City, Metro Manila',
    registeredDate: 'May 8, 2026',
    treatmentStatus: 'Active',
    birthday: 'Sep 30',
  },
  {
    id: 'pat-14',
    name: 'Rafael Santos',
    initials: 'RS',
    age: 39,
    gender: 'Male',
    lastAppointment: 'Jun 26, 2026',
    lastAppointmentReason: 'Braces Adjustment',
    address: 'Iloilo City, Iloilo',
    registeredDate: 'Jan 5, 2026',
    treatmentStatus: 'Active',
    birthday: 'Jun 28',
  },
  {
    id: 'pat-15',
    name: 'Camille Aquino',
    initials: 'CA',
    age: 33,
    gender: 'Female',
    lastAppointment: 'Jun 26, 2026',
    lastAppointmentReason: 'Tooth Extraction',
    address: 'Baguio City, Benguet',
    registeredDate: 'Apr 17, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Nov 11',
  },
  {
    id: 'pat-16',
    name: 'Joshua Lim',
    initials: 'JL',
    age: 47,
    gender: 'Male',
    lastAppointment: 'Jun 26, 2026',
    lastAppointmentReason: 'Routine Cleaning',
    address: 'Mandaluyong City, Metro Manila',
    registeredDate: 'Jun 1, 2026',
    treatmentStatus: 'Completed',
    birthday: 'Feb 18',
  },
]

const REFERENCE_DATE = new Date(MOCK_TODAY)

function isThisMonth(dateStr: string) {
  const parsed = new Date(dateStr)
  return (
    parsed.getMonth() === REFERENCE_DATE.getMonth() &&
    parsed.getFullYear() === REFERENCE_DATE.getFullYear()
  )
}

function isWithinNextDays(monthDay: string, days: number) {
  const parsed = new Date(`${monthDay}, ${REFERENCE_DATE.getFullYear()}`)
  if (parsed < REFERENCE_DATE) {
    parsed.setFullYear(parsed.getFullYear() + 1)
  }
  const diffDays =
    (parsed.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

export function getPatientById(id: string) {
  return PATIENTS.find((patient) => patient.id === id)
}

export function computePatientsSummary(patients: PatientRow[]) {
  return {
    totalPatients: patients.length,
    newThisMonth: patients.filter((p) => isThisMonth(p.registeredDate)).length,
    activeTreatments: patients.filter((p) => p.treatmentStatus === 'Active')
      .length,
    upcomingBirthdays: patients.filter((p) => isWithinNextDays(p.birthday, 30))
      .length,
  }
}
