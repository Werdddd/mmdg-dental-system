'use client'

import { useRouter } from 'next/navigation'
import { FileText, Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDisplayDate } from '@/lib/utils'
import type { DocumentFolderRow } from '@/lib/data/documents'

interface FolderCardProps {
  folder: DocumentFolderRow
  canManage: boolean
  onRename: (folder: DocumentFolderRow) => void
  onDelete: (folder: DocumentFolderRow) => void
}

export function FolderCard({
  folder,
  canManage,
  onRename,
  onDelete,
}: FolderCardProps) {
  const router = useRouter()

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/documents/${folder.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') router.push(`/documents/${folder.id}`)
      }}
      className="relative flex cursor-pointer flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Folder actions"
            onClick={(event) => event.stopPropagation()}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation()
                onRename(folder)
              }}
            >
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive data-[highlighted]:text-destructive"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(folder)
              }}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex items-center gap-3 pr-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Folder className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{folder.name}</p>
          <p className="text-xs text-muted-foreground">
            Created {formatDisplayDate(folder.createdAt.slice(0, 10))}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t pt-4 text-sm text-muted-foreground">
        <FileText className="size-3.5" />
        {folder.documentCount} document{folder.documentCount === 1 ? '' : 's'}
      </div>
    </div>
  )
}
