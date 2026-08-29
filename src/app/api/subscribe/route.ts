import { NextResponse } from 'next/server'
import { subscribe } from '@/lib/subscribers'
import { sendNewsletterWelcomeEmail } from '@/lib/newsletterEmail'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let email: string
  let source: string | undefined
  let fields: Record<string, string> | undefined
  let newsletterOptIn = false

  try {
    const body = await request.json()
    email = body?.email
    // `group` kept as a backwards-compatible alias for older clients.
    source =
      typeof body?.source === 'string'
        ? body.source
        : typeof body?.group === 'string'
          ? body.group
          : undefined
    fields =
      body?.fields && typeof body.fields === 'object' && !Array.isArray(body.fields)
        ? body.fields
        : undefined
    newsletterOptIn = body?.newsletterOptIn === true
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const result = await subscribe({ email, source, fields, newsletterOptIn })

  if (!result.ok) {
    return NextResponse.json({ error: result.detail }, { status: result.status })
  }

  // Send the one-time welcome only when this call newly opts someone in.
  // Best-effort: the subscriber is already saved, so a mail failure must not
  // turn into an error for the visitor.
  if (result.newlyOptedIn) {
    try {
      await sendNewsletterWelcomeEmail({ email })
    } catch (err) {
      console.error('[subscribe] welcome email threw:', err)
    }
  }

  return NextResponse.json({ success: true, isNewSubscriber: result.isNewSubscriber })
}
