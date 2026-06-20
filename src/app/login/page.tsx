import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Mendez Multispecialty Dental Group
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
