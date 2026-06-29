'use client'

import { MoreHorizontal } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SponsorRow } from '@/lib/data/sponsors'

interface SponsorsTableProps {
  sponsors: SponsorRow[]
  onEdit: (sponsor: SponsorRow) => void
}

export function SponsorsTable({ sponsors, onEdit }: SponsorsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Sponsor</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Default Coverage</TableHead>
          <TableHead>Patients Covered</TableHead>
          <TableHead>Added</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sponsors.length === 0 && (
          <TableEmpty colSpan={6}>No sponsors match your search.</TableEmpty>
        )}
        {sponsors.map((sponsor) => (
          <TableRow key={sponsor.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {sponsor.name}
            </TableCell>
            <TableCell className="text-muted-foreground">
              <p className="whitespace-nowrap">
                {sponsor.contactPerson || '—'}
              </p>
              <p className="text-xs whitespace-nowrap">
                {sponsor.phone || sponsor.email || ''}
              </p>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {sponsor.defaultCoveragePercentage}%
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {sponsor.patientsCovered}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {sponsor.createdAt}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Sponsor actions"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(sponsor)}>
                    Edit sponsor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
