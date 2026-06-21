import type { UserRole } from '@/lib/auth/types'

export interface AllowedUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  clinicId: string | null
  status: 'Active' | 'Invited'
  dateAdded: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'SuperAdmin',
  admin: 'Admin',
  dentist: 'Dentist',
}

export const ALLOWED_USERS: AllowedUser[] = [
  {
    id: 'user-1',
    email: 'roblesandrewemmanuel@gmail.com',
    fullName: 'Andrew Robles',
    role: 'superadmin',
    clinicId: null,
    status: 'Active',
    dateAdded: 'Jan 1, 2026',
  },
  {
    id: 'user-2',
    email: 'carmen.dizon@mmdgdental.ph',
    fullName: 'Carmen Dizon',
    role: 'admin',
    clinicId: 'clinic-1',
    status: 'Active',
    dateAdded: 'Jan 10, 2026',
  },
  {
    id: 'user-3',
    email: 'robert.aquino@mmdgdental.ph',
    fullName: 'Robert Aquino',
    role: 'admin',
    clinicId: 'clinic-2',
    status: 'Active',
    dateAdded: 'Feb 1, 2026',
  },
  {
    id: 'user-4',
    email: 'sarah.reyes@mmdgdental.ph',
    fullName: 'Dr. Sarah Reyes',
    role: 'dentist',
    clinicId: 'clinic-1',
    status: 'Active',
    dateAdded: 'Jan 14, 2026',
  },
  {
    id: 'user-5',
    email: 'michael.tan@mmdgdental.ph',
    fullName: 'Dr. Michael Tan',
    role: 'dentist',
    clinicId: 'clinic-1',
    status: 'Active',
    dateAdded: 'Jan 14, 2026',
  },
  {
    id: 'user-6',
    email: 'elena.cruz@mmdgdental.ph',
    fullName: 'Dr. Elena Cruz',
    role: 'dentist',
    clinicId: 'clinic-2',
    status: 'Active',
    dateAdded: 'Feb 2, 2026',
  },
  {
    id: 'user-7',
    email: 'joshua.santos@mmdgdental.ph',
    fullName: 'Dr. Joshua Santos',
    role: 'dentist',
    clinicId: 'clinic-2',
    status: 'Active',
    dateAdded: 'Feb 2, 2026',
  },
  {
    id: 'user-8',
    email: 'patricia.lim@mmdgdental.ph',
    fullName: 'Dr. Patricia Lim',
    role: 'dentist',
    clinicId: 'clinic-3',
    status: 'Invited',
    dateAdded: 'Jun 18, 2026',
  },
]
