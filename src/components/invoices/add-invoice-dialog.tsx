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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PatientPicker } from '@/components/shared/patient-picker'
import type { InvoiceDiscountType, InvoiceRow } from '@/components/invoices/data'
import type { PatientRow } from '@/components/patients/data'
import type { TreatmentRecordRow } from '@/lib/data/treatment-records'
import { formatCurrency } from '@/lib/utils'
import { generateInvoiceAction } from '@/app/(app)/invoices/actions'

const DISCOUNT_OPTIONS: { value: InvoiceDiscountType; label: string }[] = [
  { value: 'None', label: 'No Discount' },
  { value: 'PWD/Senior Citizen', label: 'PWD / Senior Citizen (20%)' },
  { value: 'Special Discount', label: 'Special Discount' },
]

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
  const [discountType, setDiscountType] = useState<InvoiceDiscountType>('None')
  const [specialDiscountPercentage, setSpecialDiscountPercentage] = useState('')
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
    setDiscountType('None')
    setSpecialDiscountPercentage('')
    setError(null)
  }

  function handleDiscountTypeChange(value: InvoiceDiscountType) {
    setDiscountType(value)
    if (value !== 'Special Discount') setSpecialDiscountPercentage('')
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

  const specialDiscountValue = Number(specialDiscountPercentage)
  const isSpecialDiscountValid =
    specialDiscountPercentage.trim().length > 0 &&
    Number.isFinite(specialDiscountValue) &&
    specialDiscountValue >= 0 &&
    specialDiscountValue <= 100

  const discountPercentage =
    discountType === 'PWD/Senior Citizen'
      ? 20
      : discountType === 'Special Discount' && isSpecialDiscountValid
        ? specialDiscountValue
        : 0
  const discountAmount = Math.round(((subtotal * discountPercentage) / 100) * 100) / 100
  const total = subtotal - discountAmount

  const canSubmit =
    patientId.length > 0 &&
    selectedIds.length > 0 &&
    dueDate.length > 0 &&
    (discountType !== 'Special Discount' || isSpecialDiscountValid) &&
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
        discountType,
        discountPercentage,
      })
      onAdd(invoice)
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not generate invoice. Please try again.',
      )
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

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Discount
            </label>
            <Select
              value={discountType}
              onValueChange={(value) =>
                value && handleDiscountTypeChange(value as InvoiceDiscountType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCOUNT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {discountType === 'Special Discount' && (
              <Input
                type="number"
                min={0}
                max={100}
                className="mt-2"
                value={specialDiscountPercentage}
                onChange={(event) =>
                  setSpecialDiscountPercentage(event.target.value)
                }
                placeholder="Discount percentage, e.g. 10"
              />
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="space-y-1 rounded-lg border border-dashed p-3 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </p>
              {discountAmount > 0 && (
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Discount ({discountPercentage}%)
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </p>
              )}
              <p className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </p>
            </div>
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
