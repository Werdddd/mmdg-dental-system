'use client'

import { useActionState, useState } from 'react'
import { resetPassword, type ResetPasswordState } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'

const initialState: ResetPasswordState = { error: null }

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-[400px]">

        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-300/40">
            <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden="true">
              <path
                d="M20 5C13 5 9 9.5 9 15c0 3.5 1.5 6 3.2 8.2C14.5 26 14 31 20 35c6-4 5.5-9 7.8-11.8C29.5 21 31 18.5 31 15c0-5.5-4-10-11-10Z"
                fill="white"
              />
              <path d="M20 10c-1.5 0-2.5 1-2.5 2s1 2 2.5 2 2.5-1 2.5-2-1-2-2.5-2Z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[22px] font-black tracking-[0.2em] text-gray-900 uppercase leading-none">
              Mendez
            </p>
            <p className="text-[10px] font-bold tracking-[0.15em] text-violet-600 uppercase leading-none">
              Multispecialty Dental Group
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white px-8 py-8 shadow-xl shadow-gray-200/60 ring-1 ring-gray-100/80">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
            <p className="mt-1 text-sm text-gray-400">
              Must be at least 8 characters.
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-5">
            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="h-11 pl-9 pr-10 border-gray-200 focus-visible:ring-violet-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="h-11 pl-9 pr-10 border-gray-200 focus-visible:ring-violet-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {state.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">!</span>
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-150 hover:from-violet-700 hover:to-purple-700 disabled:opacity-60"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Updating…
                </span>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
