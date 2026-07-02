'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Search, UserPlus } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import type { StaffUser } from '@/lib/data/staff'
import type { UserRole } from '@/lib/auth/types'
import { formatDisplayDate } from '@/lib/utils'
import {
  addStaffAction,
  removeStaffAction,
  updateStaffProfileAction,
} from '@/app/(app)/clinics/actions'

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'SuperAdmin',
  admin: 'Admin',
  dentist: 'Dentist',
  receptionist: 'Receptionist',
  dental_assistant: 'Dental Assistant',
}

const INVITE_ROLES: Extract<
  UserRole,
  'admin' | 'dentist' | 'receptionist' | 'dental_assistant'
>[] = ['admin', 'dentist', 'receptionist', 'dental_assistant']

const PAGE_SIZE_OPTIONS = ['5', '10', '25', '50']

function initialsOf(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface ClinicStaffPanelProps {
  clinicId: string
  staff: StaffUser[]
  currentUserId: string
}

export function ClinicStaffPanel({
  clinicId,
  staff,
  currentUserId,
}: ClinicStaffPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)

  const [open, setOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFirstName, setInviteFirstName] = useState('')
  const [inviteLastName, setInviteLastName] = useState('')
  const [inviteRole, setInviteRole] =
    useState<(typeof INVITE_ROLES)[number]>('dentist')
  const [inviteError, setInviteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return staff
    return staff.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q),
    )
  }, [search, staff])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size)

  function handleRoleChange(user: StaffUser, role: UserRole) {
    setUpdatingId(user.id)
    startTransition(async () => {
      const result = await updateStaffProfileAction(user.id, role, clinicId)
      setUpdatingId(null)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  function handleRemove(id: string) {
    setUpdatingId(id)
    startTransition(async () => {
      const result = await removeStaffAction(id, clinicId)
      setUpdatingId(null)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  function resetInviteForm() {
    setInviteEmail('')
    setInviteFirstName('')
    setInviteLastName('')
    setInviteRole('dentist')
    setInviteError(null)
  }

  function handleInvite() {
    if (
      !inviteEmail.trim() ||
      !inviteFirstName.trim() ||
      !inviteLastName.trim()
    )
      return
    setInviteError(null)
    startTransition(async () => {
      const result = await addStaffAction(
        inviteEmail.trim(),
        inviteFirstName.trim(),
        inviteLastName.trim(),
        inviteRole,
        clinicId,
      )
      if (result.error) {
        setInviteError(result.error)
        return
      }
      resetInviteForm()
      setOpen(false)
      router.refresh()
    })
  }

  const canInvite =
    inviteEmail.trim().length > 0 &&
    inviteFirstName.trim().length > 0 &&
    inviteLastName.trim().length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Staff</h2>
          <p className="text-sm text-muted-foreground">
            Dentists, receptionists, and dental assistants assigned to this
            clinic.
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
              onChange={(e) => {
                setSearch(e.target.value)
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
            <DialogTrigger
              className={buttonVariants({ className: 'gap-1.5 shrink-0' })}
            >
              <UserPlus className="size-4" />
              Add Staff
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
                <DialogDescription>
                  The account is created immediately. The staff member can use
                  &ldquo;Forgot Password&rdquo; on the login page to set their
                  password and sign in — no email acceptance needed.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@mmdgdental.ph"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      placeholder="Cruz"
                    />
                  </div>
                </div>
                {inviteFirstName.trim() && inviteLastName.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Default password:{' '}
                    <span className="font-mono font-medium text-foreground">
                      {inviteFirstName.trim().charAt(0).toUpperCase() +
                        inviteFirstName.trim().slice(1).toLowerCase()}
                      {inviteLastName.trim().charAt(0).toUpperCase() +
                        inviteLastName.trim().slice(1).toLowerCase()}
                      {new Date().getFullYear()}
                    </span>
                  </p>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) =>
                      v && setInviteRole(v as typeof inviteRole)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVITE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {inviteError && (
                  <p className="text-sm text-destructive">{inviteError}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!canInvite || isPending}>
                  {isPending ? 'Adding…' : 'Add Staff'}
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
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableEmpty colSpan={4}>
                {staff.length === 0
                  ? 'No staff assigned to this clinic yet.'
                  : 'No staff match your search.'}
              </TableEmpty>
            )}
            {visible.map((user) => {
              const isUpdating = updatingId === user.id && isPending
              const isSelf = user.id === currentUserId

              return (
                <TableRow
                  key={user.id}
                  className={isUpdating ? 'opacity-50' : undefined}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>
                          {initialsOf(user.fullName || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium whitespace-nowrap">
                          {user.fullName || '—'}
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
                      disabled={isUpdating || isSelf}
                      onValueChange={(v) =>
                        v && handleRoleChange(user, v as UserRole)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVITE_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDisplayDate(user.createdAt.slice(0, 10))}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Staff actions"
                        disabled={isSelf || isUpdating}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
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
              )
            })}
          </TableBody>
        </Table>

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(v) => {
            setPageSize(v)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}
