import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ContentOfficeInputs, ContentOfficeResult } from '@/lib/contentOfficeData'

export const runtime = 'nodejs'

interface SubmitRequestBody {
  inputs?: ContentOfficeInputs
  result?: ContentOfficeResult
}

function isValidInputs(i: unknown): i is ContentOfficeInputs {
  if (!i || typeof i !== 'object') return false
  const v = i as Partial<ContentOfficeInputs>
  return (
    typeof v.role === 'string' &&
    Array.isArray(v.intents) &&
    typeof v.audience === 'string' &&
    Array.isArray(v.pillars) &&
    Array.isArray(v.channels)
  )
}

function isValidResult(r: unknown): r is ContentOfficeResult {
  if (!r || typeof r !== 'object') return false
  const v = r as Partial<ContentOfficeResult>
  return typeof v.profile === 'string' && Array.isArray(v.pillars) && Array.isArray(v.starterSequence) && !!v.gaps && !!v.channelFit && !!v.rhythm
}

export async function POST(request: Request) {
  let body: SubmitRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidInputs(body.inputs)) {
    return NextResponse.json({ error: 'Valid inputs required' }, { status: 400 })
  }
  if (!isValidResult(body.result)) {
    return NextResponse.json({ error: 'Valid result required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[content-office-submit] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('content_office_submissions')
    .insert({
      role: body.inputs.role,
      intents: body.inputs.intents,
      audience: body.inputs.audience,
      pillars: body.inputs.pillars,
      channels: body.inputs.channels,
      result: body.result,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[content-office-submit] insert failed:', error)
    return NextResponse.json({ error: 'Could not save submission' }, { status: 502 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
