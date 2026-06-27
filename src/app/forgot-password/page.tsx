'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword, type ForgotPasswordState } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

const initialState: ForgotPasswordState = { error: null, success: false }

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, initialState)

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
          {state.success ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  We sent a password reset link to your email address. It may take a minute to arrive.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
                <p className="mt-1 text-sm text-gray-400">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form action={formAction} className="flex flex-col gap-5">
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
                      placeholder="you@example.com"
                      className="h-11 pl-9 border-gray-200 focus-visible:ring-violet-200"
                    />
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
                      Sending…
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
