'use client'

import { useEffect, useMemo, useRef, type ChangeEvent } from 'react'
import { Camera, Upload, X } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface PatientPhotoFieldProps {
  file: File | null
  removed: boolean
  existingUrl?: string
  initials: string
  onFileChange: (file: File | null) => void
  onRemove: () => void
}

export function PatientPhotoField({
  file,
  removed,
  existingUrl,
  initials,
  onFileChange,
  onRemove,
}: PatientPhotoFieldProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  )

  // Revoke the previous object URL once it's no longer in use (either the
  // file changed or the component unmounted) — this effect only cleans up,
  // it never sets state.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displayUrl = previewUrl || (!removed ? existingUrl : undefined)

  function handleFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null
    if (picked) onFileChange(picked)
    event.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20">
        {displayUrl ? (
          <AvatarImage src={displayUrl} alt="Patient photo" />
        ) : (
          <AvatarFallback className="text-xl">{initials || '—'}</AvatarFallback>
        )}
      </Avatar>
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Profile Photo{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => uploadInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Upload Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="size-3.5" />
            Take Photo
          </Button>
          {displayUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive"
              onClick={onRemove}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePicked}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFilePicked}
        />
      </div>
    </div>
  )
}
