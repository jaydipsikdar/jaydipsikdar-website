import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAdvisorPDF } from '@/lib/generateAdvisorPDF'
import { subscribeToMailerLite } from '@/lib/mailerlite'
import type { MarketingAdvisorResult } from '@/components/AdvisorResults'

const PDF_BUCKET = 'vendor-check-reports'

export const runtime = 'nodejs'

interface ExportAdvisorPdfRequestBody {
  result?: MarketingAdvisorResult
  email?: string
}

function isValidResult(result: unknown): result is MarketingAdvisorResult {
  if (!result || typeof result !== 'object') return false
  const r = result as Partial<MarketingAdvisorResult>
  return (
    typeof r.category === 'string' &&
    typeof r.diagnosis === 'string' &&
    typeof r.firstThingToFix === 'string' &&
    Array.isArray(r.moves) &&
    r.moves.length > 0 &&
    typeof r.whatWouldBreak === 'string' &&
    typeof r.oneQuestion === 'string'
  )
}

export async function POST(request: Request) {
  let body: ExportAdvisorPdfRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidResult(body.result)) {
    return NextResponse.json({ error: 'Valid advisory result required' }, { status: 400 })
  }
  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[export-advisor-pdf] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let pdfBytes: Uint8Array
  try {
    pdfBytes = generateAdvisorPDF(body.result)
  } catch (err) {
    console.error('[export-advisor-pdf] PDF generation failed:', err)
    return NextResponse.json({ error: 'Could not generate PDF' }, { status: 500 })
  }

  const dateStamp = new Date().toISOString().slice(0, 10)
  const uniqueSuffix = Math.random().toString(36).slice(2, 8)
  const filename = `marketing-advisor-report-${body.result.category}-${dateStamp}-${uniqueSuffix}.pdf`

  // Service role key — server-side only, bypasses RLS. Never expose to the client.
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let url: string
  try {
    const { error: uploadError } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filename, Buffer.from(pdfBytes), {
        contentType: 'application/pdf',
        upsert: false,
      })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(filename)
    url = data.publicUrl
  } catch (err) {
    console.error('[export-advisor-pdf] Supabase upload failed:', err)
    return NextResponse.json({ error: 'Could not store PDF' }, { status: 502 })
  }

  const subscribeResult = await subscribeToMailerLite({
    email: body.email,
    group: 'marketing-advisor',
    fields: { advisor_pdf_url: url },
  })

  if (!subscribeResult.ok) {
    return NextResponse.json({ error: subscribeResult.detail }, { status: subscribeResult.status })
  }

  return NextResponse.json({ success: true, url })
}
