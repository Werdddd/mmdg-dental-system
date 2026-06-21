import type { VariantProps } from 'class-variance-authority'

import { Badge, type badgeVariants } from '@/components/ui/badge'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

interface StatusBadgeProps<TStatus extends string> {
  status: TStatus
  variants: Record<TStatus, BadgeVariant>
}

export function StatusBadge<TStatus extends string>({
  status,
  variants,
}: StatusBadgeProps<TStatus>) {
  return <Badge variant={variants[status]}>{status}</Badge>
}
