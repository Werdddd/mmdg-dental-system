'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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
import { PatientPicker } from '@/components/shared/patient-picker'
import type { InvoiceRow } from '@/components/invoices/data'
import type { PatientRow } from '@/components/patients/data'
import type { TreatmentRecordRow } from '@/lib/data/treatment-records'
import { formatCurrency } from '@/lib/utils'
import { generateInvoiceAction } from '@/app/(app)/invoices/actions'

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientRow[]
  pendingTreatments: TreatmentRecordRow[]
  onAdd: (invoice: InvoiceRow) => void
}

export function AddInvoiceDialog({
  open,
  onOpenChange,
  patients,
  pendingTreatments,
  onAdd,
}: AddInvoiceDialogProps) {
  const router = useRouter()
  const [patientId, setPatientId] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patientTreatments = useMemo(
    () => pendingTreatments.filter((t) => t.patientId === patientId),
    [pendingTreatments, patientId],
  )

  function resetForm() {
    setPatientId('')
    setSelectedIds([])
    setDueDate('')
    setError(null)
  }

  function handlePatientChange(id: string) {
    setPatientId(id)
    setSelectedIds(
      pendingTreatments.filter((t) => t.patientId === id).map((t) => t.id),
    )
  }

  function toggleTreatment(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const subtotal = patientTreatments
    .filter((t) => selectedIds.includes(t.id))
    .reduce((sum, t) => sum + t.cost, 0)

  const canSubmit =
    patientId.length > 0 &&
    selectedIds.length > 0 &&
    dueDate.length > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const invoice = await generateInvoiceAction({
        patientId,
        treatmentRecordIds: selectedIds,
        dueDate,
      })
      onAdd(invoice)
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Could not generate invoice. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Generate an invoice from a patient&apos;s pending treatments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PatientPicker
            patients={patients}
            value={patientId}
            onValueChange={handlePatientChange}
          />

          {patientId && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Pending Treatments
              </label>
              {patientTreatments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  This patient has no pending treatments to invoice. Log a
                  treatment from the patient&apos;s dental chart first.
                </p>
              ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {patientTreatments.map((treatment) => (
                    <label
                      key={treatment.id}
                      className="flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={selectedIds.includes(treatment.id)}
                          onChange={() => toggleTreatment(treatment.id)}
                        />
                        <span>
                          {treatment.treatment}
                          {treatment.tooth ? ` — Tooth #${treatment.tooth}` : ''}
                          <span className="text-muted-foreground">
                            {' '}
                            · {treatment.dentist}
                          </span>
                        </span>
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {formatCurrency(treatment.cost)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          {selectedIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(subtotal)}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Generating…' : 'Generate Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
