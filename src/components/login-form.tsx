'use client'

import { useActionState, useState, useRef } from 'react'
import { login, type LoginState } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const formRef = useRef<HTMLFormElement>(null)

  const emailError = touched.email && !email ? 'Email is required' : null
  const passwordError = touched.password && !password ? 'Password is required' : null

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-5"
      onKeyDown={(e) => {
        if (e.key === 'Enter') formRef.current?.requestSubmit()
      }}
    >
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <Mail
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="you@example.com"
            suppressHydrationWarning
            className={`h-11 pl-9 ${
              emailError
                ? 'border-red-300 focus-visible:ring-red-200'
                : 'border-gray-200 focus-visible:ring-violet-200'
            }`}
            aria-describedby={emailError ? 'email-error' : undefined}
            aria-invalid={!!emailError}
          />
        </div>
        {emailError && (
          <p id="email-error" className="text-xs text-red-500" role="alert">
            {emailError}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700">
            Password
          </label>
          <a
            href="/forgot-password"
            className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline focus:outline-none"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            placeholder="••••••••"
            suppressHydrationWarning
            className={`h-11 pl-9 pr-10 ${
              passwordError
                ? 'border-red-300 focus-visible:ring-red-200'
                : 'border-gray-200 focus-visible:ring-violet-200'
            }`}
            aria-describedby={passwordError ? 'password-error' : undefined}
            aria-invalid={!!passwordError}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError && (
          <p id="password-error" className="text-xs text-red-500" role="alert">
            {passwordError}
          </p>
        )}
      </div>

      {/* Server error */}
      {state.error && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          role="alert"
        >
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            !
          </span>
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-150 hover:from-violet-700 hover:to-purple-700 hover:shadow-violet-300 disabled:opacity-60"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Signing in…
          </span>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  )
}
