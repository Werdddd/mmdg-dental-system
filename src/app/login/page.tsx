import Image from 'next/image'
import { LoginForm } from '@/components/login-form'
import heroImage from '../../../public/signin-hero.png'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">

      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[58%] xl:w-[62%] flex-col overflow-hidden bg-gradient-to-br from-violet-800 via-purple-700 to-indigo-700">

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[36rem] w-[36rem] rounded-full bg-violet-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-300/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Upper content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-14 pb-4 pt-16 text-center">
          {/* Trust badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium tracking-wide text-white/90">
              Trusted by 10,000+ patients
            </span>
          </div>

          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
            Your Smile,
            <br />
            <span className="text-violet-200">Our Priority</span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-violet-100/70">
            Advanced multispecialty dental care tailored to every patient —
            precision, technology, and compassion in every visit.
          </p>

          {/* Specialty pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {['General Dentistry', 'Orthodontics', 'Oral Surgery', 'Cosmetic Care'].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Hero image — negative margin-top eats the PNG's built-in top whitespace */}
        <div className="relative z-10 flex w-full shrink-0 justify-center overflow-hidden" style={{ maxHeight: '42vh', marginTop: '-60px' }}>
          <Image
            src={heroImage}
            alt="Dental professionals"
            priority
            style={{ width: 'auto', height: '100%', maxHeight: '42vh', display: 'block', objectFit: 'contain', objectPosition: 'bottom' }}
          />
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">

          {/* Branding */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-300/40">
              <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden="true">
                <path
                  d="M20 5C13 5 9 9.5 9 15c0 3.5 1.5 6 3.2 8.2C14.5 26 14 31 20 35c6-4 5.5-9 7.8-11.8C29.5 21 31 18.5 31 15c0-5.5-4-10-11-10Z"
                  fill="white"
                />
                <path
                  d="M20 10c-1.5 0-2.5 1-2.5 2s1 2 2.5 2 2.5-1 2.5-2-1-2-2.5-2Z"
                  fill="white"
                  fillOpacity="0.4"
                />
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

          {/* Login card */}
          <div className="rounded-2xl bg-white px-8 py-8 shadow-xl shadow-gray-200/60 ring-1 ring-gray-100/80">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-400">
                Sign in to access your clinic dashboard
              </p>
            </div>

            <LoginForm />
          </div>

          <p className="mt-6 text-center text-[11px] text-gray-400">
            © {new Date().getFullYear()} Mendez Multispecialty Dental Group.
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
