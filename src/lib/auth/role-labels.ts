import type { UserRole } from '@/lib/auth/types'

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'SuperAdmin',
  admin: 'Admin',
  dentist: 'Dentist',
  receptionist: 'Receptionist',
  dental_assistant: 'Dental Assistant',
}
