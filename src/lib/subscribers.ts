import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Unified subscribe layer. Every email capture on the site - tools, guides,
// and the newsletter - flows through subscribe(). Supabase is the source of
// truth; Resend holds the newsletter audience for broadcasts. This replaces
// the old MailerLite integration while keeping the same result contract, so
// existing callers keep working unchanged.
export type SubscribeResult =
  | { ok: true; isNewSubscriber: boolean; newlyOptedIn: boolean }
  | { ok: false; status: number; detail: string }

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null
  // Service role key - server-side only, bypasses RLS. Never expose to client.
  return createClient(supabaseUrl, serviceRoleKey)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function subscribe(params: {
  email: string
  /** Capture surface, e.g. 'marketing-advisor', 'vendor-guide', 'newsletter'. */
  source?: string
  /** Tool merge fields (PDF urls, role, stage, …). Merged into existing. */
  fields?: Record<string, string>
  /** Only true when the person explicitly asked for the newsletter. */
  newsletterOptIn?: boolean
}): Promise<SubscribeResult> {
  const email = normalizeEmail(params.email ?? '')
  if (!email || !email.includes('@')) {
    return { ok: false, status: 400, detail: 'Valid email required' }
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error('[subscribers] Supabase env vars are not set')
    return { ok: false, status: 500, detail: 'Server misconfigured' }
  }

  const source = params.source?.trim() || 'unknown'
  const newsletterOptIn = params.newsletterOptIn === true

  // Look up any existing record so we can merge sources/fields and report
  // whether this is a brand-new subscriber (drives new-vs-returning copy).
  const { data: existing, error: selectError } = await supabase
    .from('subscribers')
    .select('sources, fields, newsletter_opt_in, resend_contact_id')
    .eq('email', email)
    .maybeSingle()

  if (selectError) {
    console.error('[subscribers] lookup failed:', selectError)
    return { ok: false, status: 502, detail: 'Could not reach subscriber store' }
  }

  const isNewSubscriber = !existing

  const mergedSources = Array.from(new Set([...(existing?.sources ?? []), source]))
  const mergedFields = { ...(existing?.fields ?? {}), ...(params.fields ?? {}) }
  // Opt-in is sticky - a later lead-magnet capture never revokes it.
  const optIn = newsletterOptIn || existing?.newsletter_opt_in === true
  // True only when this call flips someone from not-subscribed to subscribed,
  // so the caller sends the welcome email exactly once.
  const newlyOptedIn = optIn && existing?.newsletter_opt_in !== true

  const { error: upsertError } = await supabase.from('subscribers').upsert(
    {
      email,
      sources: mergedSources,
      last_source: source,
      fields: mergedFields,
      newsletter_opt_in: optIn,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  )

  if (upsertError) {
    console.error('[subscribers] upsert failed:', upsertError)
    return { ok: false, status: 502, detail: 'Could not save subscriber' }
  }

  // Only newsletter opt-ins are added to the Resend audience used for
  // broadcasts, and only once. Best-effort: a Resend hiccup must never fail
  // the capture the visitor is waiting on - they're already saved above.
  if (optIn && !existing?.resend_contact_id) {
    const contactId = await addToNewsletterAudience(email)
    if (contactId) {
      const { error } = await supabase
        .from('subscribers')
        .update({ resend_contact_id: contactId })
        .eq('email', email)
      if (error) console.error('[subscribers] storing resend_contact_id failed:', error)
    }
  }

  return { ok: true, isNewSubscriber, newlyOptedIn }
}

// Adds an email to the Resend newsletter audience. Returns the Resend contact
// id, or null if the audience isn't configured yet or the call fails - either
// way the subscriber is already in Supabase, so this degrades gracefully.
async function addToNewsletterAudience(email: string): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    console.warn('[subscribers] Resend audience not configured - stored in Supabase only')
    return null
  }

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    })
    if (error) {
      console.error('[subscribers] Resend contact create failed:', error)
      return null
    }
    return data?.id ?? null
  } catch (err) {
    console.error('[subscribers] Resend contact create threw:', err)
    return null
  }
}
