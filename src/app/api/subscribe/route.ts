import { NextResponse } from 'next/server'
import { subscribeToMailerLite } from '@/lib/mailerlite'

export async function POST(request: Request) {
  let email: string
  let group: string | undefined
  let fields: Record<string, string> | undefined

  try {
    const body = await request.json()
    email = body?.email
    group = typeof body?.group === 'string' ? body.group : undefined
    fields =
      body?.fields && typeof body.fields === 'object' && !Array.isArray(body.fields)
        ? body.fields
        : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const result = await subscribeToMailerLite({ email, group, fields })

  if (!result.ok) {
    return NextResponse.json({ error: result.detail }, { status: result.status })
  }

  return NextResponse.json({ success: true })
}
