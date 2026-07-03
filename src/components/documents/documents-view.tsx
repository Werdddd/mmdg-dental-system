'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Folder, Plus, Search, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FolderCard } from '@/components/documents/folder-card'
import type { DocumentFolderRow } from '@/lib/data/documents'
import {
  createFolderAction,
  deleteFolderAction,
  renameFolderAction,
} from '@/app/(app)/documents/actions'

interface DocumentsViewProps {
  folders: DocumentFolderRow[]
  canManage: boolean
}

export function DocumentsView({ folders, canManage }: DocumentsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [renameTarget, setRenameTarget] = useState<DocumentFolderRow | null>(
    null,
  )
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<DocumentFolderRow | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return folders
    return folders.filter((f) => f.name.toLowerCase().includes(q))
  }, [search, folders])

  function resetAddForm() {
    setName('')
    setFormError(null)
  }

  function handleAdd() {
    if (!name.trim()) return
    setFormError(null)
    startTransition(async () => {
      const result = await createFolderAction(name.trim())
      if (result.error) {
        setFormError(result.error)
        return
      }
      resetAddForm()
      setAddOpen(false)
      router.refresh()
    })
  }

  function handleRename() {
    if (!renameTarget || !renameValue.trim()) return
    setRenameError(null)
    startTransition(async () => {
      const result = await renameFolderAction(
        renameTarget.id,
        renameValue.trim(),
      )
      if (result.error) {
        setRenameError(result.error)
        return
      }
      setRenameTarget(null)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteFolderAction(deleteTarget.id)
      if (result.error) {
        setDeleteError(result.error)
        return
      }
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <Badge variant="purple">{folders.length} folders</Badge>
        </div>
        <p className="text-muted-foreground">
          Shared clinic documents, forms, and reference files.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search folders…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {canManage && (
          <Dialog
            open={addOpen}
            onOpenChange={(next) => {
              setAddOpen(next)
              if (!next) resetAddForm()
            }}
          >
            <DialogTrigger className={buttonVariants({ className: 'gap-1.5' })}>
              <Plus className="size-4" />
              New Folder
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Folder</DialogTitle>
                <DialogDescription>
                  Create a folder to organize shared documents.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Folder Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Consent Forms"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!name.trim() || isPending}
                >
                  {isPending ? 'Creating…' : 'Create Folder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">
          {folders.length === 0 ? (
            <div className="flex flex-col items-center gap-2">
              <Folder className="size-8 text-muted-foreground/50" />
              No folders yet.
              {canManage && ' Create your first folder to get started.'}
            </div>
          ) : (
            'No folders match your search.'
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              canManage={canManage}
              onRename={(target) => {
                setRenameTarget(target)
                setRenameValue(target.name)
                setRenameError(null)
              }}
              onDelete={(target) => {
                setDeleteTarget(target)
                setDeleteError(null)
              }}
            />
          ))}
        </div>
      )}

      <Dialog
        open={renameTarget != null}
        onOpenChange={(next) => {
          if (!next) setRenameTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            {renameError && (
              <p className="text-sm text-destructive">{renameError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!renameValue.trim() || isPending}
            >
              {isPending ? 'Saving…' : 'Save'}
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
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  This permanently deletes{' '}
                  <span className="font-medium text-foreground">
                    {deleteTarget.name}
                  </span>{' '}
                  and its {deleteTarget.documentCount} document
                  {deleteTarget.documentCount === 1 ? '' : 's'}. This cannot be
                  undone.
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
              {isPending ? 'Deleting…' : 'Delete Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
