'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  pageSize: string
  pageSizeOptions: readonly string[]
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: string) => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  totalCount,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Show</span>
        <Select
          value={pageSize}
          onValueChange={(value) => value && onPageSizeChange(value)}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          of {totalCount} result{totalCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Previous page"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex size-8 items-center justify-center rounded-lg text-sm font-medium',
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label="Next page"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
