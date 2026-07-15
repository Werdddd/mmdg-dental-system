export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'dentist'
  | 'receptionist'
  | 'dental_assistant'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  must_change_password: boolean
}
