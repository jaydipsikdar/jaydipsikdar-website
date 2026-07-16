import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateVendorCheckPDF } from '@/lib/generateVendorCheckPDF'
import { subscribeToMailerLite } from '@/lib/mailerlite'
import type { VendorCheckResult } from '@/components/ResultsReport'

const PDF_BUCKET = 'vendor-check-reports'

export const runtime = 'nodejs'

interface ExportPdfRequestBody {
  result?: VendorCheckResult
  email?: string
  processStage?: string
}

function isValidResult(result: unknown): result is VendorCheckResult {
  if (!result || typeof result !== 'object') return false
  const r = result as Partial<VendorCheckResult>
  return (
    typeof r.overallScore === 'number' &&
    typeof r.riskLevel === 'string' &&
    typeof r.verdict === 'string' &&
    Array.isArray(r.parameters) &&
    r.parameters.length > 0 &&
    Array.isArray(r.topPriorities)
  )
}

export async function POST(request: Request) {
  let body: ExportPdfRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidResult(body.result)) {
    return NextResponse.json({ error: 'Valid vendor check result required' }, { status: 400 })
  }
  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[export-pdf] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let pdfBytes: Uint8Array
  try {
    pdfBytes = generateVendorCheckPDF(body.result, body.processStage)
  } catch (err) {
    console.error('[export-pdf] PDF generation failed:', err)
    return NextResponse.json({ error: 'Could not generate PDF' }, { status: 500 })
  }

  const filename = `vendor-check-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`

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
    console.error('[export-pdf] Supabase upload failed:', err)
    return NextResponse.json({ error: 'Could not store PDF' }, { status: 502 })
  }

  const subscribeResult = await subscribeToMailerLite({
    email: body.email,
    group: 'vendor-check',
    fields: { vendor_check_pdf_url: url },
  })

  if (!subscribeResult.ok) {
    return NextResponse.json({ error: subscribeResult.detail }, { status: subscribeResult.status })
  }

  return NextResponse.json({ success: true, url })
}
