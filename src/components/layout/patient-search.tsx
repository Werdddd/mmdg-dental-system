'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useClinicContext } from '@/components/layout/clinic-context'
import { searchPatientsAction } from '@/app/actions/search-patients'
import { setActiveClinicAction } from '@/app/actions/set-active-clinic'
import type { PatientSearchResult } from '@/lib/data/patients'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

export function PatientSearch() {
  const router = useRouter()
  const { activeClinicId, isSuperAdmin } = useClinicContext()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PatientSearchResult[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const latestQueryRef = useRef('')

  useEffect(() => {
    const trimmed = query.trim()
    latestQueryRef.current = trimmed
    if (trimmed.length < MIN_QUERY_LENGTH) return

    const handle = setTimeout(() => {
      startTransition(async () => {
        const found = await searchPatientsAction(trimmed)
        if (latestQueryRef.current === trimmed) setResults(found)
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDismissed(true)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSelect(patient: PatientSearchResult) {
    setDismissed(true)
    setQuery('')
    setResults([])
    if (
      isSuperAdmin &&
      patient.clinicId &&
      patient.clinicId !== activeClinicId
    ) {
      await setActiveClinicAction(patient.clinicId)
    }
    router.push(`/patients/${patient.id}`)
  }

  const trimmedQuery = query.trim()
  const showDropdown = !dismissed && trimmedQuery.length >= MIN_QUERY_LENGTH

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search patients by name or ID…"
        className="pl-9"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setDismissed(false)
        }}
        onFocus={() => setDismissed(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setDismissed(true)
        }}
      />

      {showDropdown && (
        <div className="absolute top-full left-0 z-40 mt-1.5 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
          {isPending ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No patients found for &ldquo;{trimmedQuery}&rdquo;.
            </p>
          ) : (
            <ul className="max-h-80 divide-y overflow-y-auto">
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(patient)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {patient.patientCode}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {patient.clinicName}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
