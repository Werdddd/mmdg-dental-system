'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Presentation,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { formatDisplayDate, formatFileSize } from '@/lib/utils'
import type { DocumentRow } from '@/lib/data/documents'
import {
  deleteDocumentAction,
  getDocumentUrlAction,
  uploadDocumentAction,
} from '@/app/(app)/documents/actions'

interface FolderViewProps {
  folder: { id: string; name: string }
  documents: DocumentRow[]
  canManage: boolean
}

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

export function FolderView({ folder, documents, canManage }: FolderViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [busyDocId, setBusyDocId] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return documents
    return documents.filter((doc) => doc.name.toLowerCase().includes(q))
  }, [search, documents])

  function resetUploadForm() {
    setUploadFile(null)
    setUploadError(null)
  }

  function handleUpload() {
    if (!uploadFile) return
    setUploadError(null)
    const formData = new FormData()
    formData.set('folderId', folder.id)
    formData.set('file', uploadFile)
    startTransition(async () => {
      const result = await uploadDocumentAction(formData)
      if (result.error) {
        setUploadError(result.error)
        return
      }
      resetUploadForm()
      setUploadOpen(false)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteDocumentAction(deleteTarget.id, folder.id)
      if (result.error) {
        setDeleteError(result.error)
        return
      }
      setDeleteTarget(null)
      router.refresh()
    })
  }

  // Printing works by opening the signed URL in a new tab so the browser's
  // native PDF/image viewer can handle Ctrl+P. Office files (docx/xlsx/pptx)
  // can't be rendered inline by the browser, so this simply downloads them
  // instead — there's no client-side Office renderer in scope.
  function handleView(doc: DocumentRow) {
    setBusyDocId(doc.id)
    startTransition(async () => {
      const result = await getDocumentUrlAction(doc.filePath)
      setBusyDocId(null)
      if (result.error || !result.url) {
        alert(result.error ?? 'Unable to open document.')
        return
      }
      window.open(result.url, '_blank', 'noopener,noreferrer')
    })
  }

  function handleDownload(doc: DocumentRow) {
    setBusyDocId(doc.id)
    startTransition(async () => {
      const result = await getDocumentUrlAction(doc.filePath, doc.name)
      setBusyDocId(null)
      if (result.error || !result.url) {
        alert(result.error ?? 'Unable to download document.')
        return
      }
      window.location.href = result.url
    })
  }

  return (
    <>
      <div>
        <Link
          href="/documents"
          className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Documents
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{folder.name}</h1>
        <p className="text-muted-foreground">
          {documents.length} document{documents.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {canManage && (
          <Dialog
            open={uploadOpen}
            onOpenChange={(next) => {
              setUploadOpen(next)
              if (!next) resetUploadForm()
            }}
          >
            <Button className="gap-1.5" onClick={() => setUploadOpen(true)}>
              <Upload className="size-4" />
              Upload
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  PDF, images, or Office documents up to 20MB.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  {uploadFile ? uploadFile.name : 'Choose a file'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    setUploadFile(event.target.files?.[0] ?? null)
                    event.target.value = ''
                  }}
                />
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isPending}
                >
                  {isPending ? 'Uploading…' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table containerClassName="rounded-xl border bg-card shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty colSpan={5}>
              {documents.length === 0
                ? 'No documents in this folder yet.'
                : 'No documents match your search.'}
            </TableEmpty>
          ) : (
            filtered.map((doc) => {
              const Icon = getFileIcon(doc.fileType)
              const busy = busyDocId === doc.id
              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.uploadedByName ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(doc.fileSize)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDisplayDate(doc.createdAt.slice(0, 10))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View / Print"
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
                      {canManage && (
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
    </>
  )
}
