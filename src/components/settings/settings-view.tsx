'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClinicsPanel } from '@/components/settings/clinics-panel'
import { ModulesPanel } from '@/components/settings/modules-panel'
import { UserAccessPanel } from '@/components/settings/user-access-panel'
import { CLINICS, type Clinic } from '@/components/settings/clinics-data'

export function SettingsView() {
  const [clinics, setClinics] = useState<Clinic[]>(CLINICS)

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure modules, clinics, and staff access for your system.
        </p>
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Modules &amp; Controls</TabsTrigger>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
          <TabsTrigger value="access">User Access</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <ModulesPanel />
        </TabsContent>

        <TabsContent value="clinics">
          <ClinicsPanel clinics={clinics} onClinicsChange={setClinics} />
        </TabsContent>

        <TabsContent value="access">
          <UserAccessPanel clinics={clinics} />
        </TabsContent>
      </Tabs>
    </>
  )
}
