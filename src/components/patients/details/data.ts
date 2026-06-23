import { MOCK_TODAY } from '@/lib/utils'
import type { PatientRow } from '@/components/patients/data'
import { DENTISTS } from '@/components/shared/clinic-roster'
import type { PaymentMethod } from '@/components/payments/data'
import type { InvoiceStatus } from '@/components/invoices/data'

function hashSeed(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash || 1
}

function createRandom(seedStr: string) {
  let seed = hashSeed(seedStr)
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
}

function pickFrom<T>(rand: () => number, pool: readonly T[]): T {
  return pool[Math.floor(rand() * pool.length)]
}

function pickInt(rand: () => number, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1))
}

function shiftDate(value: string, days: number) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatPatientCode(id: string) {
  const num = Number(id.replace('pat-', '')) || 0
  return `PT-${String(num).padStart(4, '0')}`
}

/* ---------- Adult tooth chart (Universal Numbering System) ---------- */

export type ToothCondition =
  | 'Healthy'
  | 'Cavity'
  | 'Filled'
  | 'Crown'
  | 'Root Canal'
  | 'Missing'

export interface ToothRecord {
  tooth: number
  condition: ToothCondition
  treatmentPerformed: string
  lastUpdated: string
  dentist: string
}

export const UPPER_ARCH = Array.from({ length: 16 }, (_, i) => i + 1)
export const LOWER_ARCH = Array.from({ length: 16 }, (_, i) => 32 - i)

const TOOTH_NAMES_BY_POSITION = [
  'Third Molar',
  'Second Molar',
  'First Molar',
  'Second Premolar',
  'First Premolar',
  'Canine',
  'Lateral Incisor',
  'Central Incisor',
]

function toothInfo(tooth: number) {
  if (tooth >= 1 && tooth <= 8) {
    return { quadrant: 'Upper Right', name: TOOTH_NAMES_BY_POSITION[tooth - 1] }
  }
  if (tooth >= 9 && tooth <= 16) {
    return { quadrant: 'Upper Left', name: TOOTH_NAMES_BY_POSITION[16 - tooth] }
  }
  if (tooth >= 17 && tooth <= 24) {
    return { quadrant: 'Lower Left', name: TOOTH_NAMES_BY_POSITION[tooth - 17] }
  }
  return { quadrant: 'Lower Right', name: TOOTH_NAMES_BY_POSITION[32 - tooth] }
}

export function formatToothLabel(tooth: number) {
  const { quadrant, name } = toothInfo(tooth)
  return `Tooth #${tooth} (${quadrant} ${name})`
}

const NON_HEALTHY_CONDITIONS: Exclude<ToothCondition, 'Healthy'>[] = [
  'Cavity',
  'Filled',
  'Crown',
  'Root Canal',
  'Missing',
]

const TREATMENT_BY_CONDITION: Record<
  Exclude<ToothCondition, 'Healthy'>,
  string
> = {
  Cavity: 'Pending treatment',
  Filled: 'Composite Filling',
  Crown: 'Porcelain Crown Placement',
  'Root Canal': 'Root Canal Therapy',
  Missing: 'Tooth Extraction (Prior History)',
}

export function getDentalChart(patient: PatientRow): ToothRecord[] {
  const rand = createRandom(`${patient.id}-chart`)
  const affectedCount = pickInt(rand, 3, 6)
  const allTeeth = Array.from({ length: 32 }, (_, i) => i + 1)
  const affected = new Set<number>()
  while (affected.size < affectedCount) {
    affected.add(pickFrom(rand, allTeeth))
  }

  return allTeeth.map((tooth) => {
    if (!affected.has(tooth)) {
      return {
        tooth,
        condition: 'Healthy',
        treatmentPerformed: '—',
        lastUpdated: '—',
        dentist: '—',
      }
    }
    const condition = pickFrom(rand, NON_HEALTHY_CONDITIONS)
    return {
      tooth,
      condition,
      treatmentPerformed: TREATMENT_BY_CONDITION[condition],
      lastUpdated: shiftDate(patient.lastAppointment, -pickInt(rand, 14, 380)),
      dentist: pickFrom(rand, DENTISTS).name,
    }
  })
}

/* ---------- Visit profiles, keyed by lastAppointmentReason ---------- */

interface VisitProfile {
  complaint: string
  symptoms: string
  area: string
  diagnosis: string
  remarks: string
  dentistNote: string
  reminder: string
  followUp: string
}

const VISIT_PROFILES: Record<string, VisitProfile> = {
  'Routine Cleaning': {
    complaint: 'Routine dental cleaning and oral health checkup',
    symptoms: 'Mild plaque buildup; no pain reported',
    area: 'Full mouth',
    diagnosis: 'Mild gingivitis',
    remarks:
      'Gums slightly inflamed near lower molars; advised better flossing technique.',
    dentistNote:
      'Performed scaling and polishing; oral hygiene is generally good.',
    reminder: 'Schedule next cleaning in 6 months.',
    followUp: 'Continue brushing twice daily and flossing at least once a day.',
  },
  'Root Canal Follow-up': {
    complaint: 'Follow-up evaluation after root canal therapy',
    symptoms: 'Occasional sensitivity to cold; mild tenderness when chewing',
    area: 'Tooth #19 (Lower Left First Molar)',
    diagnosis: 'Post-endodontic sensitivity',
    remarks: 'Healing progressing well; no signs of infection.',
    dentistNote:
      'Root canal site healing as expected; crown placement to be discussed.',
    reminder: 'Avoid chewing hard food on the treated side.',
    followUp: 'Return in 2 weeks for permanent crown fitting.',
  },
  'Tooth Extraction': {
    complaint: 'Severe tooth pain that led to extraction',
    symptoms: 'Throbbing pain, swelling, difficulty chewing',
    area: 'Tooth #17 (Lower Left Third Molar)',
    diagnosis: 'Non-restorable tooth (extracted)',
    remarks: 'Extraction site clean; mild swelling expected for 2-3 days.',
    dentistNote:
      'Extraction completed without complications; prescribed antibiotics and pain relief.',
    reminder: 'Apply cold compress and avoid rinsing vigorously for 24 hours.',
    followUp: 'Follow-up visit in 1 week to check healing.',
  },
  'Dental Checkup': {
    complaint: 'Routine dental checkup',
    symptoms: 'No reported pain or discomfort',
    area: 'Full mouth',
    diagnosis: 'No abnormalities detected',
    remarks: 'All findings normal.',
    dentistNote: 'No cavities or gum issues detected during examination.',
    reminder: 'Continue regular oral hygiene routine.',
    followUp: 'Next checkup recommended in 6 months.',
  },
  'Braces Adjustment': {
    complaint: 'Scheduled orthodontic adjustment',
    symptoms: 'Mild discomfort and pressure after adjustment',
    area: 'Upper and lower dental arches',
    diagnosis: 'Malocclusion (ongoing orthodontic treatment)',
    remarks: 'Teeth alignment progressing as planned.',
    dentistNote:
      'Adjusted archwire tension; tracking well against treatment plan.',
    reminder: 'Mild soreness is normal for 2-3 days after adjustment.',
    followUp: 'Next adjustment scheduled in 4 weeks.',
  },
  Consultation: {
    complaint: 'Initial dental consultation',
    symptoms: 'Concerned about overall oral health',
    area: 'Full mouth',
    diagnosis: 'Pending evaluation',
    remarks: 'Recommended treatment plan to be finalized on next visit.',
    dentistNote: 'Discussed treatment options and cost estimates with patient.',
    reminder: 'Bring previous dental records, if available, on next visit.',
    followUp: 'Schedule treatment planning session within 2 weeks.',
  },
  'Teeth Whitening': {
    complaint: 'Requests cosmetic teeth whitening',
    symptoms: 'Mild tooth discoloration; no pain',
    area: 'Upper and lower anterior teeth',
    diagnosis: 'Extrinsic tooth discoloration',
    remarks:
      'Whitening session completed; mild sensitivity expected for 24 hours.',
    dentistNote:
      'In-office whitening performed; shade improved by several levels.',
    reminder: 'Avoid staining foods and drinks for 48 hours.',
    followUp: 'Touch-up session optional in 6-12 months.',
  },
  'Dental Implant Review': {
    complaint: 'Post-implant review and evaluation',
    symptoms: 'Mild swelling around implant site, otherwise stable',
    area: 'Tooth #30 (Lower Right First Molar)',
    diagnosis: 'Osseointegration in progress',
    remarks: 'Implant integrating well; healing on track.',
    dentistNote:
      'Implant stability confirmed; no signs of infection or rejection.',
    reminder: 'Avoid hard or sticky foods near the implant site.',
    followUp: 'Next review scheduled in 3 months.',
  },
  'Cavity Filling': {
    complaint: 'Tooth pain triggered by sweets and cold drinks',
    symptoms: 'Localized sensitivity; visible cavity',
    area: 'Tooth #14 (Upper Left First Molar)',
    diagnosis: 'Dental caries',
    remarks: 'Composite filling completed successfully.',
    dentistNote:
      'Cavity removed and filled with composite resin; bite checked and adjusted.',
    reminder:
      'Reduce sugar intake and avoid biting on the filled tooth for a few hours.',
    followUp:
      'Monitor for sensitivity; return if discomfort persists beyond a week.',
  },
  'Pediatric Checkup': {
    complaint: 'Routine pediatric dental checkup',
    symptoms: 'No complaints from patient or guardian',
    area: 'Primary and erupting permanent teeth',
    diagnosis: 'Healthy primary dentition',
    remarks: 'Healthy dental development for age.',
    dentistNote:
      'Applied fluoride varnish; reinforced brushing habits with patient.',
    reminder: 'Encourage parental supervision during brushing.',
    followUp: 'Next pediatric checkup in 6 months.',
  },
  'Gum Treatment': {
    complaint: 'Gum bleeding and inflammation',
    symptoms: 'Bleeding gums when brushing; mild bad breath',
    area: 'Lower anterior gumline',
    diagnosis: 'Early-stage gingivitis',
    remarks: 'Deep cleaning performed; gums less inflamed after treatment.',
    dentistNote: 'Performed scaling and root planing for early gum disease.',
    reminder: 'Use prescribed antiseptic mouthwash twice daily.',
    followUp: 'Re-evaluate gum health in 4 weeks.',
  },
  'Wisdom Tooth Consultation': {
    complaint: 'Pain and pressure near wisdom tooth',
    symptoms: 'Jaw discomfort; slight swelling near molar',
    area: 'Tooth #32 (Lower Right Third Molar)',
    diagnosis: 'Partially impacted third molar',
    remarks: 'Impaction suspected; X-ray recommended.',
    dentistNote:
      'Clinical signs suggest partial impaction; awaiting imaging before extraction decision.',
    reminder: 'Take over-the-counter pain relief as needed.',
    followUp: 'Return after X-ray results to discuss extraction options.',
  },
}

const DEFAULT_VISIT_PROFILE: VisitProfile = {
  complaint: 'General dental visit',
  symptoms: 'No significant symptoms reported',
  area: 'Full mouth',
  diagnosis: 'No abnormalities detected',
  remarks: 'No additional remarks.',
  dentistNote: 'Routine visit; no concerns noted.',
  reminder: 'Maintain regular oral hygiene.',
  followUp: 'Schedule next visit as needed.',
}

function getVisitProfile(reason: string) {
  return VISIT_PROFILES[reason] ?? DEFAULT_VISIT_PROFILE
}

/* ---------- About / contact / emergency contact ---------- */

export interface EmergencyContact {
  name: string
  relation: string
  phone: string
}

export interface PatientAbout {
  dateOfBirth: string
  age: number
  gender: PatientRow['gender']
  nationality: string
  civilStatus: string
  bloodType: string
  contactNumber: string
  email: string
  emergencyContact: EmergencyContact
}

export interface ChiefComplaint {
  primaryComplaint: string
  symptoms: string
  affectedArea: string
  remarks: string
}

export interface PatientNotes {
  dentistNotes: string
  treatmentReminders: string
  followUpInstructions: string
}

export interface PatientProfile {
  patientCode: string
  primaryDentist: string
  about: PatientAbout
  chiefComplaint: ChiefComplaint
  notes: PatientNotes
}

const NATIONALITIES = [
  'Filipino',
  'Filipino',
  'Filipino',
  'Filipino-Chinese',
  'Filipino-American',
]
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated']
const BLOOD_TYPES = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
const EMERGENCY_RELATIONS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Guardian',
  'Friend',
]
const EMERGENCY_FIRST_NAMES = [
  'Antonio',
  'Rosa',
  'Eduardo',
  'Teresa',
  'Manuel',
  'Carmen',
  'Ricardo',
  'Luisa',
  'Fernando',
  'Beatriz',
  'Gabriel',
  'Victoria',
]
const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com']

function formatPhone(rand: () => number) {
  const a = pickInt(rand, 900, 999)
  const b = pickInt(rand, 100, 999)
  const c = pickInt(rand, 1000, 9999)
  return `+63 ${a} ${b} ${c}`
}

const REFERENCE_YEAR = new Date(MOCK_TODAY).getFullYear()

export function getPatientProfile(patient: PatientRow): PatientProfile {
  const rand = createRandom(`${patient.id}-profile`)
  const profile = getVisitProfile(patient.lastAppointmentReason)
  const primaryDentist = pickFrom(rand, DENTISTS).name

  const birthYear = REFERENCE_YEAR - patient.age
  const surname = patient.name.trim().split(/\s+/).slice(-1)[0]
  const emergencyFirstName = pickFrom(rand, EMERGENCY_FIRST_NAMES)
  const isMinor = patient.age < 18

  const emailHandle = patient.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .join('.')

  return {
    patientCode: formatPatientCode(patient.id),
    primaryDentist,
    about: {
      dateOfBirth: `${patient.birthday}, ${birthYear}`,
      age: patient.age,
      gender: patient.gender,
      nationality: pickFrom(rand, NATIONALITIES),
      civilStatus: isMinor ? 'Single' : pickFrom(rand, CIVIL_STATUSES),
      bloodType: pickFrom(rand, BLOOD_TYPES),
      contactNumber: formatPhone(rand),
      email: `${emailHandle}@${pickFrom(rand, EMAIL_DOMAINS)}`,
      emergencyContact: {
        name: `${emergencyFirstName} ${surname}`,
        relation: isMinor ? 'Parent' : pickFrom(rand, EMERGENCY_RELATIONS),
        phone: formatPhone(rand),
      },
    },
    chiefComplaint: {
      primaryComplaint: profile.complaint,
      symptoms: profile.symptoms,
      affectedArea: profile.area,
      remarks: profile.remarks,
    },
    notes: {
      dentistNotes: `${primaryDentist}: ${profile.dentistNote}`,
      treatmentReminders: profile.reminder,
      followUpInstructions: profile.followUp,
    },
  }
}

/* ---------- Dental history ---------- */

export interface DentalHistoryEntry {
  id: string
  date: string
  time: string
  procedure: string
  toothArea: string
  diagnosis: string
  dentist: string
  status: 'Completed' | 'Ongoing' | 'Cancelled'
}

const TIME_POOL = [
  '9:00 AM',
  '10:30 AM',
  '11:15 AM',
  '1:15 PM',
  '2:00 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
]

interface OlderProcedureTemplate {
  diagnosis: string
  wholeMouth: boolean
}

const OLDER_PROCEDURES: Record<string, OlderProcedureTemplate> = {
  'Oral Examination': {
    diagnosis: 'No abnormalities detected',
    wholeMouth: true,
  },
  'Dental Cleaning': {
    diagnosis: 'Mild plaque and tartar buildup',
    wholeMouth: true,
  },
  'Cavity Filling': { diagnosis: 'Dental caries', wholeMouth: false },
  'Tooth Extraction': { diagnosis: 'Non-restorable tooth', wholeMouth: false },
  'Root Canal Treatment': {
    diagnosis: 'Irreversible pulpitis',
    wholeMouth: false,
  },
  'Scaling and Polishing': { diagnosis: 'Gingivitis', wholeMouth: true },
  'X-Ray Examination': {
    diagnosis: 'Impacted wisdom tooth',
    wholeMouth: false,
  },
  'Crown Placement': {
    diagnosis: 'Fractured tooth restored with crown',
    wholeMouth: false,
  },
  'Fluoride Treatment': {
    diagnosis: 'Early enamel demineralization',
    wholeMouth: true,
  },
}

const OLDER_PROCEDURE_NAMES = Object.keys(OLDER_PROCEDURES)

export function getDentalHistory(patient: PatientRow): DentalHistoryEntry[] {
  const rand = createRandom(`${patient.id}-history`)
  const profile = getVisitProfile(patient.lastAppointmentReason)

  const entries: DentalHistoryEntry[] = [
    {
      id: `${patient.id}-hist-0`,
      date: patient.lastAppointment,
      time: pickFrom(rand, TIME_POOL),
      procedure: patient.lastAppointmentReason,
      toothArea: profile.area,
      diagnosis: profile.diagnosis,
      dentist: pickFrom(rand, DENTISTS).name,
      status: patient.treatmentStatus === 'Active' ? 'Ongoing' : 'Completed',
    },
  ]

  const priorCount = pickInt(rand, 2, 4)
  let offset = pickInt(rand, 30, 60)
  for (let i = 0; i < priorCount; i++) {
    const procedureName = pickFrom(rand, OLDER_PROCEDURE_NAMES)
    const template = OLDER_PROCEDURES[procedureName]
    entries.push({
      id: `${patient.id}-hist-${i + 1}`,
      date: shiftDate(patient.lastAppointment, -offset),
      time: pickFrom(rand, TIME_POOL),
      procedure: procedureName,
      toothArea: template.wholeMouth
        ? 'Full mouth'
        : formatToothLabel(pickInt(rand, 1, 32)),
      diagnosis: template.diagnosis,
      dentist: pickFrom(rand, DENTISTS).name,
      status: 'Completed',
    })
    offset += pickInt(rand, 45, 120)
  }

  return entries
}

/* ---------- Payment history ---------- */

export interface PatientPaymentEntry {
  id: string
  invoiceId: string
  date: string
  treatment: string
  amount: number
  method: PaymentMethod
  status: InvoiceStatus
  remainingBalance: number
}

const PROCEDURE_PRICES: Record<string, number> = {
  'Routine Cleaning': 1500,
  'Root Canal Follow-up': 500,
  'Tooth Extraction': 3200,
  'Dental Checkup': 500,
  'Braces Adjustment': 1800,
  Consultation: 500,
  'Teeth Whitening': 6500,
  'Dental Implant Review': 1000,
  'Cavity Filling': 2200,
  'Pediatric Checkup': 500,
  'Gum Treatment': 2500,
  'Wisdom Tooth Consultation': 800,
  'Oral Examination': 500,
  'Dental Cleaning': 1500,
  'Root Canal Treatment': 8500,
  'Scaling and Polishing': 1200,
  'X-Ray Examination': 800,
  'Crown Placement': 12500,
  'Fluoride Treatment': 700,
}

function priceFor(procedure: string) {
  return PROCEDURE_PRICES[procedure] ?? 1000
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Card',
  'Bank',
  'GCash',
  'Maya',
]

function patientNumber(patient: PatientRow) {
  return Number(patient.id.replace('pat-', '')) || 0
}

export function getPaymentHistory(patient: PatientRow): PatientPaymentEntry[] {
  const rand = createRandom(`${patient.id}-payments`)
  const history = getDentalHistory(patient)

  return history.map((entry, index) => {
    const amount = priceFor(entry.procedure)
    const method = pickFrom(rand, PAYMENT_METHODS)

    let status: InvoiceStatus
    if (index === 0 && entry.status === 'Ongoing') {
      status = pickFrom(rand, ['Unpaid', 'Partially Paid'] as const)
    } else {
      status =
        rand() < 0.85
          ? 'Paid'
          : pickFrom(rand, ['Partially Paid', 'Unpaid'] as const)
    }

    const remainingBalance =
      status === 'Paid'
        ? 0
        : status === 'Partially Paid'
          ? Math.round(amount * (0.3 + rand() * 0.4))
          : amount

    return {
      id: entry.id,
      invoiceId: `INV-${3000 + patientNumber(patient) * 10 + index}`,
      date: entry.date,
      treatment: entry.procedure,
      amount,
      method,
      status,
      remainingBalance,
    }
  })
}
