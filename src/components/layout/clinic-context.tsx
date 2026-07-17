'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { ClinicRecord } from '@/lib/data/clinics'
import type { UserRole } from '@/lib/auth/types'

interface ClinicContextValue {
  clinics: ClinicRecord[]
  activeClinicId: string | null
  isSuperAdmin: boolean
  profileRole: UserRole
}

const ClinicContext = createContext<ClinicContextValue>({
  clinics: [],
  activeClinicId: null,
  isSuperAdmin: false,
  profileRole: 'dentist',
})

export function ClinicProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ClinicContextValue
}) {
  return (
    <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
  )
}

export function useClinicContext() {
  return useContext(ClinicContext)
}
