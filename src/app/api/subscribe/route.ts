import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    console.error('MAILERLITE_API_KEY is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
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

  if (!res.ok) {
    const body = await res.text()
    console.error('MailerLite error:', res.status, body)
    return NextResponse.json({ error: 'Subscription failed' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
