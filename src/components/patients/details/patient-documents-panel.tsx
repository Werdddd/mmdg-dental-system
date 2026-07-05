'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Plus,
  Presentation,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PatientDocumentRow } from '@/lib/data/patient-documents'
import {
  deletePatientDocumentAction,
  getPatientDocumentUrlAction,
  uploadPatientDocumentAction,
} from '@/app/(app)/patients/actions'

const ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx'

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return ImageIcon
  if (fileType.includes('spreadsheet') || fileType.includes('excel'))
    return FileSpreadsheet
  if (fileType.includes('presentation') || fileType.includes('powerpoint'))
    return Presentation
  return FileText
}

interface PatientDocumentsPanelProps {
  patientId: string
  documents: PatientDocumentRow[]
  readOnly?: boolean
}

export function PatientDocumentsPanel({
  patientId,
  documents,
  readOnly = false,
}: PatientDocumentsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [busyDocId, setBusyDocId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PatientDocumentRow | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function resetUploadForm() {
    setFile(null)
    setCaption('')
    setUploadError(null)
  }

  function handleUpload() {
    if (!file) {
      setUploadError('Please choose a file to upload.')
      return
    }
    if (!caption.trim()) {
      setUploadError('A caption or note is required.')
      return
    }
    setUploadError(null)
    const formData = new FormData()
    formData.set('patientId', patientId)
    formData.set('caption', caption.trim())
    formData.set('file', file)
    startTransition(async () => {
      try {
        await uploadPatientDocumentAction(formData)
        resetUploadForm()
        setUploadOpen(false)
        router.refresh()
      } catch {
        setUploadError('Could not upload this document. Please try again.')
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      try {
        await deletePatientDocumentAction(patientId, deleteTarget.id)
        setDeleteTarget(null)
        router.refresh()
      } catch {
        setDeleteError('Could not delete this document. Please try again.')
      }
    })
  }

  function handleView(doc: PatientDocumentRow) {
    setBusyDocId(doc.id)
    startTransition(async () => {
      const result = await getPatientDocumentUrlAction(doc.filePath)
      setBusyDocId(null)
      if (result.error || !result.url) {
        alert(result.error ?? 'Unable to open document.')
        return
      }
      window.open(result.url, '_blank', 'noopener,noreferrer')
    })
  }

  function handleDownload(doc: PatientDocumentRow) {
    setBusyDocId(doc.id)
    startTransition(async () => {
      const result = await getPatientDocumentUrlAction(doc.filePath, doc.name)
      setBusyDocId(null)
      if (result.error || !result.url) {
        alert(result.error ?? 'Unable to download document.')
        return
      }
      window.location.href = result.url
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {documents.length} document{documents.length === 1 ? '' : 's'}
        </p>
        {!readOnly && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="size-4" />
            Add Document
          </Button>
        )}
      </div>

      <Table containerClassName="rounded-lg border">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Caption</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableEmpty colSpan={5}>
              No documents have been uploaded yet.
            </TableEmpty>
          ) : (
            documents.map((doc) => {
              const Icon = getFileIcon(doc.fileType)
              const busy = busyDocId === doc.id
              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="max-w-[160px] truncate font-medium">
                        {doc.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {doc.caption}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {doc.uploadedByName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {doc.createdLabel}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View"
                        disabled={busy}
                        onClick={() => handleView(doc)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download"
                        disabled={busy}
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="size-4" />
                      </Button>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                          disabled={isPending}
                          onClick={() => {
                            setDeleteTarget(doc)
                            setDeleteError(null)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <Dialog
        open={uploadOpen}
        onOpenChange={(next) => {
          setUploadOpen(next)
          if (!next) resetUploadForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>
              Attach a file relating to this patient — IDs, referrals, insurance
              cards, lab results, and more.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">File</label>
              <Input
                type="file"
                accept={ACCEPT}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Caption / Note
              </label>
              <Textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="What is this document? e.g. Valid ID, referral letter, lab result…"
                className="min-h-[72px]"
              />
            </div>

            {uploadError && (
              <p className="text-sm text-destructive" role="alert">
                {uploadError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isPending}>
              {isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  This permanently deletes{' '}
                  <span className="font-medium text-foreground">
                    {deleteTarget.name}
                  </span>
                  . This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="size-4" />
              {isPending ? 'Deleting…' : 'Delete Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
