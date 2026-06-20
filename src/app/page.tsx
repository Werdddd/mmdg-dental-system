import { redirect } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import { getCurrentProfile } from '@/lib/auth/profile'
import type { UserRole } from '@/lib/auth/types'
import { Button } from '@/components/ui/button'
import { ChartSection } from '@/components/chart-section'

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  dentist: 'Dentist',
}

export default async function Home() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Mendez Multispecialty Dental Group
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            MMDG Dental System
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Signed in as {profile.full_name ?? 'User'} ·{' '}
            {ROLE_LABELS[profile.role]}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <section className="flex flex-wrap gap-3">
        <Button>Primary action</Button>
        <Button variant="outline">Secondary</Button>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">Monthly appointments</h2>
        <div className="h-72 w-full">
          <ChartSection />
        </div>
      </section>
    </main>
  )
}
