export type UserRole = 'superadmin' | 'admin' | 'dentist'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  clinic_id: string | null
}
