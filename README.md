# MMDG Dental System

The dental clinic management system of Mendez Multispecialty Dental Group.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + Database)
- **Charts:** Recharts
- **UI:** shadcn/ui

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase project URL and anon key from the [Supabase dashboard](https://supabase.com/dashboard).

3. Run the database migration in `supabase/migrations/0001_clinics_profiles_roles.sql` (Supabase dashboard SQL editor, or `supabase db push` if using the CLI). It creates the `clinics`/`profiles` tables, the `superadmin`/`admin`/`dentist` role enum, and RLS policies.

4. Create your first SuperAdmin account via the Supabase Admin API (there's no public signup — see [Authentication](#authentication) below), then start the dev server:

   ```bash
   npm run dev
   ```

## Authentication

Accounts are provisioned by an Admin or SuperAdmin — there is no public signup page, and **the Supabase Dashboard's "Add user" dialog will not work**: the `handle_new_user` trigger needs `role`/`clinic_id` in `user_metadata` at the moment the user is created (it runs in the same transaction as the `auth.users` insert), but the Dashboard has no way to set `user_metadata` at creation time. Any user created there fails a check constraint immediately and never actually gets created.

Use the bundled script instead:

```bash
npm run create-user -- --email=jane@mmdg.com --password=secret123 \
  --full-name="Jane Doe" --role=dentist --clinic="Default Clinic" \
  --specialty="General Dentist"
```

`--role` is `superadmin`, `admin`, or `dentist`. `--clinic` (required for admin/dentist) accepts an existing clinic's name or UUID — if no clinic matches that name, one is created. `--specialty` is optional, dentist-only. Sets `user_metadata` correctly via the Supabase Admin API. Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see `.env.example`; get it from Supabase Dashboard > Project Settings > API — never commit it).

The `handle_new_user` trigger copies that metadata into `public.profiles` automatically.

Roles:

- **SuperAdmin** — manages all clinics.
- **Admin** — manages one clinic (`clinic_id` required).
- **Dentist** — belongs to one clinic (`clinic_id` required).

All routes except `/login` require a signed-in session (enforced in `src/proxy.ts`).

## Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `npm run dev`          | Start Next.js dev server |
| `npm run build`        | Production build         |
| `npm run start`        | Start production server  |
| `npm run lint`         | Run ESLint               |
| `npm run format`       | Format with Prettier     |
| `npm run format:check` | Check formatting         |

## Project structure

```
src/
├── app/                # Next.js App Router routes, layout, globals.css
│   └── login/          # /login route, form, and sign-in/sign-out server actions
├── components/
│   ├── ui/              # shadcn/ui components
│   └── login-form.tsx   # Client component used by /login
├── lib/
│   ├── auth/            # Role types + getCurrentProfile() helper
│   ├── supabase/        # Browser/server/middleware Supabase clients
│   └── utils.ts          # Shared utilities (cn helper)
└── proxy.ts             # Route protection (redirects unauthenticated requests to /login)

supabase/migrations/      # SQL schema: clinics, profiles, roles, RLS policies
```

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component-name>
```

Components are added to `src/components/ui/`.
