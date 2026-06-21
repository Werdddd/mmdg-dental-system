export interface Clinic {
  id: string
  name: string
  address: string
  phone: string
}

export const CLINICS: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'MMDG Dental — Quezon City',
    address: 'EDSA cor. Timog Ave, Quezon City, Metro Manila',
    phone: '+63 2 8123 4567',
  },
  {
    id: 'clinic-2',
    name: 'MMDG Dental — Makati',
    address: 'Ayala Ave, Makati City, Metro Manila',
    phone: '+63 2 8234 5678',
  },
  {
    id: 'clinic-3',
    name: 'MMDG Dental — Cebu',
    address: 'Osmeña Blvd, Cebu City, Cebu',
    phone: '+63 32 234 5678',
  },
]
