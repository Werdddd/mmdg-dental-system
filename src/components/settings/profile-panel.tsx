'use client'

import { useState, useTransition } from 'react'
import { Building2, Lock, ShieldCheck, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/auth/types'
import {
  changePasswordAction,
  updateProfileAction,
} from '@/app/(app)/settings/profile-actions'

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  dentist: 'Dentist',
}

export interface CurrentUserProfile {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  clinicName: string | null
  specialty: string | null
}

interface ProfilePanelProps {
  profile: CurrentUserProfile
}

export function ProfilePanel({ profile }: ProfilePanelProps) {
  const [isPending, startTransition] = useTransition()

  // Profile form
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [specialty, setSpecialty] = useState(profile.specialty ?? '')
  const [profileMsg, setProfileMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Password form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  function handleProfileSave() {
    if (!firstName.trim() || !lastName.trim()) return
    setProfileMsg(null)
    startTransition(async () => {
      const result = await updateProfileAction(firstName, lastName, specialty)
      setProfileMsg(
        result.error
          ? { type: 'error', text: result.error }
          : { type: 'success', text: 'Profile updated successfully.' },
      )
    })
  }

  function handlePasswordChange() {
    if (!newPassword || !confirmPassword) return
    setPasswordMsg(null)
    startTransition(async () => {
      const result = await changePasswordAction(newPassword, confirmPassword)
      if (result.error) {
        setPasswordMsg({ type: 'error', text: result.error })
      } else {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
        setNewPassword('')
        setConfirmPassword('')
      }
    })
  }

  const isDentist = profile.role === 'dentist'
  const hasClinic = profile.clinicName !== null

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Account Information</h2>
            <p className="text-xs text-muted-foreground">
              Update your name{isDentist ? ', specialty,' : ''} and view your
              account details.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* Name row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                First Name
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Cruz"
              />
            </div>
          </div>

          {/* Specialty — dentists only */}
          {isDentist && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Specialty
              </label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. General Dentist, Orthodontist"
              />
            </div>
          )}

          {/* Read-only info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <div className="flex h-9 items-center rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground">
                {profile.email}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Role
              </label>
              <div className="flex h-9 items-center gap-2 rounded-lg border bg-muted/50 px-3">
                <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm">{ROLE_LABELS[profile.role]}</span>
              </div>
            </div>
          </div>

          {hasClinic && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Assigned Clinic
              </label>
              <div className="flex h-9 items-center gap-2 rounded-lg border bg-muted/50 px-3">
                <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm">{profile.clinicName}</span>
              </div>
            </div>
          )}

          {profileMsg && (
            <p
              className={
                profileMsg.type === 'success'
                  ? 'text-sm text-green-600'
                  : 'text-sm text-destructive'
              }
            >
              {profileMsg.text}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleProfileSave}
              disabled={isPending || !firstName.trim() || !lastName.trim()}
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Change Password</h2>
            <p className="text-xs text-muted-foreground">
              Update your password. Must be at least 8 characters.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          {passwordMsg && (
            <p
              className={
                passwordMsg.type === 'success'
                  ? 'text-sm text-green-600'
                  : 'text-sm text-destructive'
              }
            >
              {passwordMsg.text}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handlePasswordChange}
              disabled={isPending || !newPassword || !confirmPassword}
            >
              {isPending ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
