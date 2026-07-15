'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Pencil } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoCard, InfoRow } from '@/components/patients/details/info-card'
import { ClinicSummaryCards } from '@/components/clinics/clinic-summary-cards'
import { ClinicStaffPanel } from '@/components/clinics/clinic-staff-panel'
import { ROLE_LABELS } from '@/lib/auth/role-labels'
import type { ClinicDetail } from '@/lib/data/clinics'
import type { StaffUser } from '@/lib/data/staff'
import { computePaymentsSummary, type PaymentRow } from '@/components/payments/data'
import { cn, formatDisplayDate } from '@/lib/utils'
import { updateClinicAction } from '@/app/(app)/clinics/actions'

interface ClinicDetailsViewProps {
  clinic: ClinicDetail
  staff: StaffUser[]
  payments: PaymentRow[]
  patientCount: number
  appointmentCount: number
  currentUserId: string
}

export function ClinicDetailsView({
  clinic,
  staff,
  payments,
  patientCount,
  appointmentCount,
  currentUserId,
}: ClinicDetailsViewProps) {
  const { totalRevenue } = computePaymentsSummary(payments)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(clinic.name)
  const [address, setAddress] = useState(clinic.address ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  const roleCounts = staff.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {})

  function handleSave() {
    if (!name.trim()) return
    setFormError(null)
    startTransition(async () => {
      const result = await updateClinicAction(clinic.id, name.trim(), address.trim())
      if (result.error) {
        setFormError(result.error)
        return
      }
      setEditOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Link
        href="/clinics"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1.5 px-2')}
      >
        <ArrowLeft className="size-4" />
        Back to Clinics
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {clinic.name}
            </h1>
            <p className="text-muted-foreground">
              {clinic.address || 'No address on file'}
            </p>
          </div>
        </div>

        <Dialog
          open={editOpen}
          onOpenChange={(next) => {
            setEditOpen(next)
            if (!next) {
              setName(clinic.name)
              setAddress(clinic.address ?? '')
              setFormError(null)
            }
          }}
        >
          <Button variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit Clinic
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Clinic</DialogTitle>
              <DialogDescription>
                Update this clinic&rsquo;s name and address.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Clinic Name
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || isPending}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ClinicSummaryCards
        totalRevenue={totalRevenue}
        totalPatients={patientCount}
        totalAppointments={appointmentCount}
        totalStaff={staff.length}
      />

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="info">Clinic Info</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <ClinicStaffPanel
            clinicId={clinic.id}
            staff={staff}
            currentUserId={currentUserId}
          />
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InfoCard title="Clinic Details" icon={Building2}>
              <InfoRow label="Name" value={clinic.name} />
              <InfoRow label="Address" value={clinic.address || '—'} />
              <InfoRow
                label="Added On"
                value={formatDisplayDate(clinic.createdAt.slice(0, 10))}
              />
              <InfoRow label="Total Staff" value={staff.length} />
            </InfoCard>

            <InfoCard title="Staff Breakdown">
              {(
                ['admin', 'dentist', 'receptionist', 'dental_assistant'] as const
              ).map((role) => (
                <InfoRow
                  key={role}
                  label={ROLE_LABELS[role]}
                  value={roleCounts[role] ?? 0}
                />
              ))}
            </InfoCard>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
