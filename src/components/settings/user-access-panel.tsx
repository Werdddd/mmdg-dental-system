'use client'

import { useMemo, useState } from 'react'
import { MoreHorizontal, Search, UserPlus } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type badgeVariants } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/shared/pagination'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Clinic } from '@/components/settings/clinics-data'
import {
  ALLOWED_USERS,
  ROLE_LABELS,
  type AllowedUser,
} from '@/components/settings/users-data'
import type { UserRole } from '@/lib/auth/types'

const TODAY = 'Jun 21, 2026'
const ROLES: UserRole[] = ['superadmin', 'admin', 'dentist']
const PAGE_SIZE_OPTIONS = ['5', '10', '25', '50']

const STATUS_VARIANT: Record<
  AllowedUser['status'],
  VariantProps<typeof badgeVariants>['variant']
> = {
  Active: 'success',
  Invited: 'warning',
}

function initialsOf(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface UserAccessPanelProps {
  clinics: Clinic[]
}

export function UserAccessPanel({ clinics }: UserAccessPanelProps) {
  const [users, setUsers] = useState<AllowedUser[]>(ALLOWED_USERS)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('dentist')
  const [clinicId, setClinicId] = useState<string | null>(
    clinics[0]?.id ?? null,
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.fullName.toLowerCase().includes(query),
    )
  }, [search, users])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = filtered.slice(start, start + size)

  function handleRoleChange(userId: string, nextRole: UserRole) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              role: nextRole,
              clinicId:
                nextRole === 'superadmin'
                  ? null
                  : (user.clinicId ?? clinics[0]?.id ?? null),
            }
          : user,
      ),
    )
  }

  function handleClinicChange(userId: string, nextClinicId: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, clinicId: nextClinicId } : user,
      ),
    )
  }

  function handleRemove(userId: string) {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
  }

  function resetInviteForm() {
    setEmail('')
    setFullName('')
    setRole('dentist')
    setClinicId(clinics[0]?.id ?? null)
  }

  function handleInvite() {
    if (!email.trim() || !fullName.trim()) return
    if (role !== 'superadmin' && !clinicId) return

    setUsers((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        email: email.trim(),
        fullName: fullName.trim(),
        role,
        clinicId: role === 'superadmin' ? null : clinicId,
        status: 'Invited',
        dateAdded: TODAY,
      },
    ])
    resetInviteForm()
    setOpen(false)
  }

  const canInvite =
    email.trim().length > 0 &&
    fullName.trim().length > 0 &&
    (role === 'superadmin' || clinicId !== null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">User Access</h2>
          <p className="text-sm text-muted-foreground">
            Allowed emails, roles, and clinic assignments for staff sign-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email…"
              className="pl-9"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>

          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (!next) resetInviteForm()
            }}
          >
            <DialogTrigger className={buttonVariants({ className: 'gap-1.5' })}>
              <UserPlus className="size-4" />
              Invite User
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
                <DialogDescription>
                  Add an allowed email with a role and, for Admins and Dentists,
                  a clinic.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@mmdgdental.ph"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Dr. Juan Dela Cruz"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={role}
                    onValueChange={(value) => {
                      if (!value) return
                      const nextRole = value as UserRole
                      setRole(nextRole)
                      if (nextRole === 'superadmin') {
                        setClinicId(null)
                      } else if (!clinicId) {
                        setClinicId(clinics[0]?.id ?? null)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {role !== 'superadmin' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Clinic
                    </label>
                    <Select
                      value={clinicId}
                      onValueChange={(value) => value && setClinicId(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!canInvite}>
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableEmpty colSpan={6}>No users match your search.</TableEmpty>
            )}
            {visible.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>
                        {initialsOf(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium whitespace-nowrap">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      value && handleRoleChange(user.id, value as UserRole)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {user.role === 'superadmin' ? (
                    <span className="text-sm text-muted-foreground">
                      All clinics
                    </span>
                  ) : (
                    <Select
                      value={user.clinicId}
                      onValueChange={(value) =>
                        value && handleClinicChange(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} variants={STATUS_VARIANT} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {user.dateAdded}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="User actions"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {user.status === 'Invited' && (
                        <DropdownMenuItem>Resend invite</DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive data-[highlighted]:text-destructive"
                        onClick={() => handleRemove(user.id)}
                      >
                        Remove access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}
