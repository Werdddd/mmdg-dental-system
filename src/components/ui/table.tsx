import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

function Table({
  className,
  containerClassName,
  ...props
}: ComponentProps<'table'> & { containerClassName?: string }) {
  return (
    <div className={cn('overflow-x-auto', containerClassName)}>
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('border-b text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y', className)} {...props} />
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('hover:bg-muted/40', className)} {...props} />
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return <th className={cn('px-5 py-3 font-medium', className)} {...props} />
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-5 py-3.5', className)} {...props} />
}

function TableEmpty({
  colSpan,
  children,
}: {
  colSpan: number
  children: ReactNode
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-12 text-center text-sm text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
}
