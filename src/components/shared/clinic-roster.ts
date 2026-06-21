export interface Dentist {
  id: string
  name: string
  initials: string
  specialty: string
}

export const DENTISTS: Dentist[] = [
  {
    id: 'dent-1',
    name: 'Dr. Sarah Reyes',
    initials: 'SR',
    specialty: 'General Dentist',
  },
  {
    id: 'dent-2',
    name: 'Dr. Michael Tan',
    initials: 'MT',
    specialty: 'Orthodontist',
  },
  {
    id: 'dent-3',
    name: 'Dr. Elena Cruz',
    initials: 'EC',
    specialty: 'Oral Surgeon',
  },
  {
    id: 'dent-4',
    name: 'Dr. Joshua Santos',
    initials: 'JS',
    specialty: 'Pediatric Dentist',
  },
  {
    id: 'dent-5',
    name: 'Dr. Patricia Lim',
    initials: 'PL',
    specialty: 'Periodontist',
  },
]

export const TREATMENTS = [
  'Dental Cleaning',
  'Root Canal Treatment',
  'Tooth Extraction',
  'Dental Filling',
  'Teeth Whitening',
  'Braces Adjustment',
  'Dental Implant',
  'Scaling and Polishing',
  'Wisdom Tooth Removal',
  'Crown Placement',
  'Veneers',
  'Checkup & Consultation',
] as const
