'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { ClinicRecord } from '@/lib/data/clinics'

interface ClinicContextValue {
  clinics: ClinicRecord[]
  activeClinicId: string | null
  isSuperAdmin: boolean
}

const ClinicContext = createContext<ClinicContextValue>({
  clinics: [],
  activeClinicId: null,
  isSuperAdmin: false,
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
