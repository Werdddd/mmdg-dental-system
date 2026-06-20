import { Bell, Menu, Search, Settings } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/75 sm:px-6">
      <button
        type="button"
        aria-label="Open menu"
        className="-ml-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search patients, appointments…"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
        </button>

        <button
          type="button"
          aria-label="Settings"
          className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
        >
          <Settings className="size-5" />
        </button>

        <div className="ml-1 flex items-center gap-2 border-l pl-3">
          <Avatar className="size-9">
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">Dr. Sarah Reyes</p>
            <p className="text-xs text-muted-foreground">General Dentist</p>
          </div>
        </div>
      </div>
    </header>
  )
}
