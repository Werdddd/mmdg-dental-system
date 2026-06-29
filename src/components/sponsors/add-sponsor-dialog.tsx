'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SponsorRow } from '@/lib/data/sponsors'
import {
  addSponsorAction,
  updateSponsorAction,
} from '@/app/(app)/sponsors/actions'

interface SponsorFormValues {
  name: string
  contactPerson: string
  phone: string
  email: string
  defaultCoveragePercentage: string
  notes: string
}

const EMPTY_VALUES: SponsorFormValues = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  defaultCoveragePercentage: '100',
  notes: '',
}

function sponsorToFormValues(sponsor: SponsorRow): SponsorFormValues {
  return {
    name: sponsor.name,
    contactPerson: sponsor.contactPerson,
    phone: sponsor.phone,
    email: sponsor.email,
    defaultCoveragePercentage: String(sponsor.defaultCoveragePercentage),
    notes: sponsor.notes,
  }
}

interface SponsorFormProps {
  sponsor: SponsorRow | null
  onCancel: () => void
  onSaved: (sponsor: SponsorRow) => void
}

function SponsorForm({ sponsor, onCancel, onSaved }: SponsorFormProps) {
  const [values, setValues] = useState<SponsorFormValues>(
    sponsor ? sponsorToFormValues(sponsor) : EMPTY_VALUES,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    values.name.trim().length > 0 &&
    values.defaultCoveragePercentage.trim().length > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const input = {
        name: values.name.trim(),
        contactPerson: values.contactPerson.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        defaultCoveragePercentage: Number(values.defaultCoveragePercentage),
        notes: values.notes.trim(),
      }
      const saved = sponsor
        ? await updateSponsorAction(sponsor.id, input)
        : await addSponsorAction(input)
      onSaved(saved)
    } catch {
      setError('Could not save this sponsor. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <Input
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Smile Foundation"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Contact Person{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              value={values.contactPerson}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, contactPerson: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Default Coverage %
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={values.defaultCoveragePercentage}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  defaultCoveragePercentage: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Phone{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              value={values.phone}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Email{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              type="email"
              value={values.email}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Notes{' '}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Textarea
            value={values.notes}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="min-h-[72px]"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? 'Saving…' : sponsor ? 'Save Changes' : 'Add Sponsor'}
        </Button>
      </DialogFooter>
    </>
  )
}

interface AddSponsorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sponsor: SponsorRow | null
  onSaved: (sponsor: SponsorRow) => void
}

export function AddSponsorDialog({
  open,
  onOpenChange,
  sponsor,
  onSaved,
}: AddSponsorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sponsor ? 'Edit Sponsor' : 'New Sponsor'}</DialogTitle>
          <DialogDescription>
            {sponsor
              ? `Update ${sponsor.name}'s details.`
              : 'Add a sponsor organization that covers patient care.'}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <SponsorForm
            key={sponsor?.id ?? 'new'}
            sponsor={sponsor}
            onCancel={() => onOpenChange(false)}
            onSaved={(saved) => {
              onSaved(saved)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
