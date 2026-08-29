// Remembers a visitor's email in their own browser so returning visitors can
// re-download resources and see "welcome back" states without retyping. This
// is a per-browser convenience only - the real record lives in Supabase. All
// access is guarded so it never throws in private mode or during SSR.

const EMAIL_KEY = 'jss_subscriber_email'
const NEWSLETTER_KEY = 'jss_newsletter_optin'

export function getRememberedEmail(): string | null {
  try {
    return window.localStorage.getItem(EMAIL_KEY)
  } catch {
    return null
  }
}

export function rememberEmail(email: string): void {
  try {
    window.localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase())
  } catch {
    // Ignore - remembering is a convenience, not a requirement.
  }
}

export function forgetEmail(): void {
  try {
    window.localStorage.removeItem(EMAIL_KEY)
  } catch {
    // Ignore.
  }
}

export function hasOptedIntoNewsletter(): boolean {
  try {
    return window.localStorage.getItem(NEWSLETTER_KEY) === 'true'
  } catch {
    return false
  }
}

export function rememberNewsletterOptIn(): void {
  try {
    window.localStorage.setItem(NEWSLETTER_KEY, 'true')
  } catch {
    // Ignore.
  }
}
