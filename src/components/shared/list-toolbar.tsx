'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Download, Plus, Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ListToolbarProps<TSort extends string> {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  sort: TSort
  sortOptions: readonly TSort[]
  onSortChange: (value: TSort) => void
  onFilterClick?: () => void
  onExportClick?: () => void
  primaryLabel: string
  primaryIcon?: LucideIcon
  onPrimaryClick?: () => void
  extra?: ReactNode
}

export function ListToolbar<TSort extends string>({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  sort,
  sortOptions,
  onSortChange,
  onFilterClick,
  onExportClick,
  primaryLabel,
  primaryIcon: PrimaryIcon = Plus,
  onPrimaryClick,
  extra,
}: ListToolbarProps<TSort>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-1.5" onClick={onFilterClick}>
          <SlidersHorizontal className="size-4" />
          Filter
        </Button>

        <Select
          value={sort}
          onValueChange={(value) => value && onSortChange(value as TSort)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {extra}

        <Button variant="outline" className="gap-1.5" onClick={onExportClick}>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <Button className="gap-1.5" onClick={onPrimaryClick}>
        <PrimaryIcon className="size-4" />
        {primaryLabel}
      </Button>
    </div>
  )
}
