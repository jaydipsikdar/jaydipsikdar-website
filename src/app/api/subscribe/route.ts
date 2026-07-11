import { NextResponse } from 'next/server'

// CMO Boardroom Kit — existing default group. Kept as the fallback so the
// Kit's signup form (which doesn't pass a `group`) keeps working unchanged.
const KIT_GROUP_ID = '191412705135953404'

// Vendor Contract Check — new group, created manually in MailerLite.
// TODO: replace with the real group ID once it exists, then update
// VendorCheckDeliveryForm.tsx to stop passing an explicit id (optional).
const VENDOR_CHECK_GROUP_ID = '192702998964602139'

export async function POST(request: Request) {
  let email: string
  let group: string | undefined

  try {
    const body = await request.json()
    email = body?.email
    group = typeof body?.group === 'string' ? body.group : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // `group` may be passed as either a raw MailerLite group ID, or one of the
  // known short names below. Anything else falls back to the Kit group so
  // existing callers (and typos) never silently fail.
  const groupId =
    group === 'vendor-check'
      ? VENDOR_CHECK_GROUP_ID
      : group === 'kit' || !group
      ? KIT_GROUP_ID
      : group

  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    console.error('[subscribe] MAILERLITE_API_KEY is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  console.log('[subscribe] Attempting to subscribe:', email, 'to group:', groupId)

  let res: Response
  try {
    res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        groups: [groupId],
      }),
    })
  } catch (err) {
    console.error('[subscribe] Network error reaching MailerLite:', err)
    return NextResponse.json({ error: 'Could not reach email provider' }, { status: 503 })
  }

  const responseBody = await res.text()

  if (!res.ok) {
    console.error('[subscribe] MailerLite returned error:', res.status, responseBody)
    return NextResponse.json({ error: 'Subscription failed', detail: res.status }, { status: 502 })
  }

  console.log('[subscribe] Success:', res.status, responseBody)
  return NextResponse.json({ success: true })
}

