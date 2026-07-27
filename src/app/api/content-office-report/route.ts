import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subscribeToMailerLite } from '@/lib/mailerlite'
import { generateContentOfficePDF } from '@/lib/generateContentOfficePDF'
import type { ContentOfficeResult } from '@/lib/contentOfficeData'

export const runtime = 'nodejs'

// Reuses the same Supabase Storage bucket as the other tools' PDF reports
// (see maturity-score-report/route.ts).
const PDF_BUCKET = 'vendor-check-reports'

interface ReportRequestBody {
  email?: string
  result?: ContentOfficeResult
}

function isValidResult(r: unknown): r is ContentOfficeResult {
  if (!r || typeof r !== 'object') return false
  const v = r as Partial<ContentOfficeResult>
  return (
    typeof v.profile === 'string' &&
    Array.isArray(v.pillars) &&
    v.pillars.length >= 2 &&
    Array.isArray(v.starterSequence) &&
    !!v.gaps &&
    !!v.channelFit &&
    !!v.rhythm &&
    !!v.inputs
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
}

export async function POST(request: Request) {
  let body: ReportRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!isValidResult(body.result)) {
    return NextResponse.json({ error: 'Valid result required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[content-office-report] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let pdfBytes: Uint8Array
  try {
    pdfBytes = generateContentOfficePDF(body.result)
  } catch (err) {
    console.error('[content-office-report] PDF generation failed:', err)
    return NextResponse.json({ error: 'Could not generate PDF' }, { status: 500 })
  }

  const dateStamp = new Date().toISOString().slice(0, 10)
  const firstPillarSlug = slugify(body.result.pillars[0]?.pillar ?? 'content-office')
  const filename = `content-office-${firstPillarSlug}-${dateStamp}.pdf`

  let pdfUrl: string
  try {
    const { error: uploadError } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filename, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(filename)
    pdfUrl = data.publicUrl
  } catch (err) {
    console.error('[content-office-report] Supabase upload failed:', err)
    return NextResponse.json({ error: 'Could not store PDF' }, { status: 502 })
  }

  // The PDF is already generated and stored, so the download link works
  // regardless of what happens below. MailerLite subscription is secondary
  // and shouldn't block or fail the response the visitor is waiting on.
  try {
    // Extra fields (starter_post_1_*, top_underused_theme) exist so the Day
    // 3 / Day 7 follow-up automations can reference real per-user content
    // via MailerLite merge tags. See docs/content-office-email-templates.md.
    const firstPost = body.result.starterSequence[0]
    const subscribeResult = await subscribeToMailerLite({
      email: body.email,
      group: 'content-office',
      fields: {
        role: body.result.inputs.role,
        audience: body.result.inputs.audience,
        pillars: body.result.inputs.pillars.join(', '),
        channels: body.result.inputs.channels.join(', '),
        content_office_pdf_url: pdfUrl,
        starter_post_1_idea: firstPost?.contentIdea ?? '',
        starter_post_1_pillar: firstPost?.pillar ?? '',
        starter_post_1_theme: firstPost?.theme ?? '',
        top_underused_theme: body.result.gaps.underusedThemes[0] ?? '',
      },
    })
    if (!subscribeResult.ok) {
      console.error('[content-office-report] MailerLite subscribe failed:', subscribeResult.detail)
    }
  } catch (err) {
    console.error('[content-office-report] MailerLite subscribe threw:', err)
  }

  return NextResponse.json({ success: true, url: pdfUrl })
}
