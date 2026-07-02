'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModulesPanel } from '@/components/settings/modules-panel'
import { ProfilePanel } from '@/components/settings/profile-panel'
import type { CurrentUserProfile } from '@/components/settings/profile-panel'

interface SettingsViewProps {
  currentProfile: CurrentUserProfile
  isSuperAdmin: boolean
}

export function SettingsView({
  currentProfile,
  isSuperAdmin,
}: SettingsViewProps) {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? 'Manage modules and your account. Clinics and staff access live under Clinics.'
            : 'Manage your account and preferences.'}
        </p>
      </div>

      <Tabs defaultValue={isSuperAdmin ? 'modules' : 'profile'}>
        <TabsList>
          {isSuperAdmin && (
            <TabsTrigger value="modules">Modules &amp; Controls</TabsTrigger>
          )}
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="modules">
            <ModulesPanel />
          </TabsContent>
        )}

        <TabsContent value="profile">
          <ProfilePanel profile={currentProfile} />
        </TabsContent>
      </Tabs>
    </>
  )
}
