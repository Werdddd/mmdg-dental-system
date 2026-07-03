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
import { formatDisplayDate } from '@/lib/utils'
import {
  addSuperAdminAction,
  removeSuperAdminAction,
} from '@/app/(app)/settings/superadmin-actions'

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

interface SuperAdminsPanelProps {
  superAdmins: StaffUser[]
  currentUserId: string
}

export function SuperAdminsPanel({
  superAdmins,
  currentUserId,
}: SuperAdminsPanelProps) {
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
  const [inviteError, setInviteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return superAdmins
    return superAdmins.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q),
    )
  }, [search, superAdmins])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size)

  function resetInviteForm() {
    setInviteEmail('')
    setInviteFirstName('')
    setInviteLastName('')
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
      const result = await addSuperAdminAction(
        inviteEmail.trim(),
        inviteFirstName.trim(),
        inviteLastName.trim(),
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

  function handleRemove(id: string) {
    setUpdatingId(id)
    startTransition(async () => {
      const result = await removeSuperAdminAction(id)
      setUpdatingId(null)
      if (result.error) alert(result.error)
      else router.refresh()
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
          <h2 className="text-base font-semibold">Super Admins</h2>
          <p className="text-sm text-muted-foreground">
            Accounts with full, system-wide access across all clinics.
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
              Add Super Admin
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Super Admin</DialogTitle>
                <DialogDescription>
                  The account is created immediately with full system access.
                  They can use &ldquo;Forgot Password&rdquo; on the login page
                  to set their password and sign in — no email acceptance
                  needed.
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
                {inviteError && (
                  <p className="text-sm text-destructive">{inviteError}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!canInvite || isPending}
                >
                  {isPending ? 'Adding…' : 'Add Super Admin'}
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
              <TableHead>Super Admin</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableEmpty colSpan={3}>
                {superAdmins.length === 0
                  ? 'No super admins yet.'
                  : 'No super admins match your search.'}
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
                          {isSelf && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDisplayDate(user.createdAt.slice(0, 10))}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Super admin actions"
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
