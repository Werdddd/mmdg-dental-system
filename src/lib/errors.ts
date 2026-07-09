import { isAuthError } from '@supabase/supabase-js'

// Thrown intentionally by the data/action layers for messages that are safe
// to show the end user (validation failures, business-rule rejections).
// Anything else — raw Postgres/Supabase errors — gets logged server-side and
// replaced with a generic message before it can reach the client, since
// those can leak schema/constraint details.
export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppError'
  }
}

const GENERIC_MESSAGE = 'Something went wrong. Please try again.'

export function toActionErrorMessage(
  e: unknown,
  fallback: string = GENERIC_MESSAGE,
): string {
  // AppError: our own intentional, curated message.
  // AuthError: Supabase Auth's own curated messages (weak password, rate
  // limit, invalid credentials, ...) — designed to be shown to the user.
  // Everything else (PostgrestError, network errors, ...) is logged and
  // replaced, since it can leak schema/constraint details.
  if (e instanceof AppError || isAuthError(e)) return e.message
  console.error(e)
  return fallback
}
