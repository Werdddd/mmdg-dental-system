'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { InfoCard } from '@/components/patients/details/info-card'
import type { PatientNoteEntry } from '@/lib/data/patient-notes'
import {
  addPatientNoteAction,
  deletePatientNoteAction,
  updatePatientNoteAction,
} from '@/app/(app)/patients/actions'

interface PatientNotesCardProps {
  patientId: string
  notes: PatientNoteEntry[]
}

function NoteComposer({
  initialValue = '',
  placeholder,
  isSaving,
  onSave,
  onCancel,
}: {
  initialValue?: string
  placeholder: string
  isSaving: boolean
  onSave: (content: string) => void
  onCancel: () => void
}) {
  const [content, setContent] = useState(initialValue)

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <Textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[72px] bg-background text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(content)}
          disabled={isSaving || content.trim().length === 0}
        >
          {isSaving ? 'Saving…' : 'Save Note'}
        </Button>
      </div>
    </div>
  )
}

export function PatientNotesCard({ patientId, notes }: PatientNotesCardProps) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(content: string) {
    if (content.trim().length === 0) return
    setSavingId('new')
    setError(null)
    try {
      await addPatientNoteAction(patientId, content.trim())
      setAdding(false)
      router.refresh()
    } catch {
      setError('Could not save note. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleEdit(noteId: string, content: string) {
    if (content.trim().length === 0) return
    setSavingId(noteId)
    setError(null)
    try {
      await updatePatientNoteAction(patientId, noteId, content.trim())
      setEditingId(null)
      router.refresh()
    } catch {
      setError('Could not save changes. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(noteId: string) {
    setSavingId(noteId)
    setError(null)
    try {
      await deletePatientNoteAction(patientId, noteId)
      router.refresh()
    } catch {
      setError('Could not delete note. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <InfoCard
      title="Notes"
      icon={NotebookPen}
      action={
        !adding && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-3.5" />
            Add Note
          </Button>
        )
      }
    >
      {adding && (
        <NoteComposer
          placeholder="Write a note about this patient…"
          isSaving={savingId === 'new'}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {notes.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">No notes recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) =>
            editingId === note.id ? (
              <li key={note.id}>
                <NoteComposer
                  initialValue={note.content}
                  placeholder="Update this note…"
                  isSaving={savingId === note.id}
                  onSave={(content) => handleEdit(note.id, content)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={note.id}
                className="group rounded-lg border bg-muted/10 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {note.authorName} &middot; {note.createdLabel}
                    {note.edited && ' (edited)'}
                  </p>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Edit note"
                      onClick={() => setEditingId(note.id)}
                      className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete note"
                      onClick={() => handleDelete(note.id)}
                      disabled={savingId === note.id}
                      className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {note.content}
                </p>
              </li>
            ),
          )}
        </ul>
      )}
    </InfoCard>
  )
}
