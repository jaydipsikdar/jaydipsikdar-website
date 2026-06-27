import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let email: string

  try {
    const body = await request.json()
    email = body?.email
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    console.error('[subscribe] MAILERLITE_API_KEY is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  console.log('[subscribe] Attempting to subscribe:', email)

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
        groups: ['191412705135953404'],
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
