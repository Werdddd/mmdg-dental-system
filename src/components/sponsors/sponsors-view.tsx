'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/shared/pagination'
import { ClinicSelector } from '@/components/layout/clinic-selector'
import { useClinicContext } from '@/components/layout/clinic-context'
import { AddSponsorDialog } from '@/components/sponsors/add-sponsor-dialog'
import { SponsorsSummaryCards } from '@/components/sponsors/sponsors-summary-cards'
import { SponsorsTable } from '@/components/sponsors/sponsors-table'
import {
  SponsorsToolbar,
  type SponsorsSortOption,
} from '@/components/sponsors/sponsors-toolbar'
import type { SponsorRow } from '@/lib/data/sponsors'

const PAGE_SIZE_OPTIONS = ['5', '10', '25', '50']

interface SponsorsViewProps {
  initialSponsors: SponsorRow[]
}

export function SponsorsView({ initialSponsors }: SponsorsViewProps) {
  const { clinics, activeClinicId, isSuperAdmin } = useClinicContext()
  const [sponsors, setSponsors] = useState<SponsorRow[]>(initialSponsors)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SponsorsSortOption>('Recent')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<SponsorRow | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = query
      ? sponsors.filter((sponsor) => sponsor.name.toLowerCase().includes(query))
      : [...sponsors]

    switch (sort) {
      case 'Oldest':
        return rows.reverse()
      case 'Name (A–Z)':
        return rows.sort((a, b) => a.name.localeCompare(b.name))
      case 'Coverage (High to Low)':
        return rows.sort(
          (a, b) => b.defaultCoveragePercentage - a.defaultCoveragePercentage,
        )
      case 'Recent':
      default:
        return rows
    }
  }, [sponsors, search, sort])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = filtered.slice(start, start + size)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: SponsorsSortOption) {
    setSort(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(value)
    setPage(1)
  }

  function handleSaved(sponsor: SponsorRow) {
    setSponsors((prev) => {
      const exists = prev.some((s) => s.id === sponsor.id)
      return exists
        ? prev.map((s) => (s.id === sponsor.id ? sponsor : s))
        : [sponsor, ...prev]
    })
    setPage(1)
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Sponsors</h1>
            <Badge variant="purple">{sponsors.length} total sponsors</Badge>
          </div>
          {isSuperAdmin && activeClinicId && clinics.length > 0 && (
            <ClinicSelector clinics={clinics} activeClinicId={activeClinicId} />
          )}
        </div>
        <p className="text-muted-foreground">
          Manage sponsor organizations and the coverage they provide to
          patients.
        </p>
      </div>

      <SponsorsSummaryCards sponsors={sponsors} />

      <SponsorsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        onNewClick={() => {
          setEditingSponsor(null)
          setDialogOpen(true)
        }}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <SponsorsTable
          sponsors={visible}
          onEdit={(sponsor) => {
            setEditingSponsor(sponsor)
            setDialogOpen(true)
          }}
        />

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <AddSponsorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sponsor={editingSponsor}
        onSaved={handleSaved}
      />
    </>
  )
}
