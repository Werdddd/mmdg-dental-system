'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Trash2, Images } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { InfoCard } from '@/components/patients/details/info-card'
import { formatToothLabel, UPPER_ARCH, LOWER_ARCH } from '@/lib/dental/teeth'
import type { ToothPhoto } from '@/lib/data/dental-chart-photos'
import {
  uploadToothPhotoAction,
  deleteToothPhotoAction,
} from '@/app/(app)/patients/actions'

const ALL_TEETH = [...UPPER_ARCH, ...LOWER_ARCH].sort((a, b) => a - b)

function toothOptionLabel(tooth: number | null) {
  return tooth == null ? 'Whole Mouth / General' : formatToothLabel(tooth)
}

interface UploadPhotoDialogProps {
  patientId: string
  defaultTooth: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UploadPhotoDialog({
  patientId,
  defaultTooth,
  open,
  onOpenChange,
}: UploadPhotoDialogProps) {
  const router = useRouter()
  const [tooth, setTooth] = useState(defaultTooth ? String(defaultTooth) : '')
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setTooth(defaultTooth ? String(defaultTooth) : '')
    setCaption('')
    setFile(null)
    setError(null)
  }

  async function handleSubmit() {
    if (!file) {
      setError('Please choose an image file to upload.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('patientId', patientId)
      formData.set('tooth', tooth)
      formData.set('caption', caption)
      formData.set('file', file)
      await uploadToothPhotoAction(formData)
      reset()
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Could not upload this photo. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Dental Chart Photo</DialogTitle>
          <DialogDescription>
            Attach an intraoral photo or X-ray to this patient&apos;s chart.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Tooth / Area
            </label>
            <Select value={tooth} onValueChange={(v) => setTooth(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    toothOptionLabel(value ? Number(value) : null)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Whole Mouth / General</SelectItem>
                {ALL_TEETH.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {formatToothLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Caption{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="e.g. Pre-op X-ray, post-treatment photo"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Uploading…' : 'Upload Photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PhotoLightbox({
  photo,
  onOpenChange,
}: {
  photo: ToothPhoto | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={photo != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {photo && (
          <>
            <DialogHeader>
              <DialogTitle>{toothOptionLabel(photo.tooth)}</DialogTitle>
              <DialogDescription>
                Uploaded by {photo.uploadedBy} &middot; {photo.createdLabel}
              </DialogDescription>
            </DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element -- private signed URL, not a static asset */}
            <img
              src={photo.url}
              alt={photo.caption || toothOptionLabel(photo.tooth)}
              className="max-h-[60vh] w-full rounded-lg border object-contain"
            />
            {photo.caption && (
              <p className="mt-3 text-sm text-muted-foreground">
                {photo.caption}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DentalChartPhotosProps {
  patientId: string
  photos: ToothPhoto[]
  defaultTooth: number | null
}

export function DentalChartPhotos({
  patientId,
  photos,
  defaultTooth,
}: DentalChartPhotosProps) {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<ToothPhoto | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(photoId: string) {
    setDeletingId(photoId)
    try {
      await deleteToothPhotoAction(patientId, photoId)
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <InfoCard
        title="Chart Photos"
        icon={Images}
        action={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setUploadOpen(true)}
          >
            <ImagePlus className="size-3.5" />
            Upload Photo
          </Button>
        }
      >
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No intraoral photos or X-rays have been uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <button
                  type="button"
                  className="block size-full"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- private signed URL, not a static asset */}
                  <img
                    src={photo.url}
                    alt={photo.caption || toothOptionLabel(photo.tooth)}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                </button>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="truncate text-xs font-medium text-white">
                    {toothOptionLabel(photo.tooth)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete photo"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                  className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </InfoCard>

      <UploadPhotoDialog
        patientId={patientId}
        defaultTooth={defaultTooth}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <PhotoLightbox
        photo={lightboxPhoto}
        onOpenChange={(open) => !open && setLightboxPhoto(null)}
      />
    </>
  )
}
