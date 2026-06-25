'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClinicsPanel } from '@/components/settings/clinics-panel'
import { ModulesPanel } from '@/components/settings/modules-panel'
import { UserAccessPanel } from '@/components/settings/user-access-panel'
import { ProfilePanel } from '@/components/settings/profile-panel'
import type { CurrentUserProfile } from '@/components/settings/profile-panel'
import type { ClinicRecord } from '@/lib/data/clinics'
import type { StaffUser } from '@/lib/data/staff'

interface SettingsViewProps {
  currentUserId: string
  currentProfile: CurrentUserProfile
  isSuperAdmin: boolean
  clinics: ClinicRecord[]
  staff: StaffUser[]
}

export function SettingsView({
  currentUserId,
  currentProfile,
  isSuperAdmin,
  clinics,
  staff,
}: SettingsViewProps) {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? 'Manage modules, clinics, staff access, and your account.'
            : 'Manage your account and preferences.'}
        </p>
      </div>

      <Tabs defaultValue={isSuperAdmin ? 'modules' : 'profile'}>
        <TabsList>
          {isSuperAdmin && (
            <>
              <TabsTrigger value="modules">Modules &amp; Controls</TabsTrigger>
              <TabsTrigger value="clinics">Clinics</TabsTrigger>
              <TabsTrigger value="access">User Access</TabsTrigger>
            </>
          )}
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <>
            <TabsContent value="modules">
              <ModulesPanel />
            </TabsContent>

            <TabsContent value="clinics">
              <ClinicsPanel clinics={clinics} staff={staff} />
            </TabsContent>

            <TabsContent value="access">
              <UserAccessPanel
                clinics={clinics}
                staff={staff}
                currentUserId={currentUserId}
              />
            </TabsContent>
          </>
        )}

        <TabsContent value="profile">
          <ProfilePanel profile={currentProfile} />
        </TabsContent>
      </Tabs>
    </>
  )
}
