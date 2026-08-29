import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subscribe } from '@/lib/subscribers'
import { generateMaturityScorePDF } from '@/lib/generateMaturityScorePDF'
import { aiStageForScore, type Qualifiers } from '@/lib/maturityScoreData'
import type { MaturityResult } from '@/lib/maturityScoring'

export const runtime = 'nodejs'

// Reuses the same Supabase Storage bucket as the other two tools' PDF
// reports (generateAdvisorPDF, generateVendorCheckPDF already write here).
const PDF_BUCKET = 'vendor-check-reports'

interface ReportRequestBody {
  submissionId?: string
  email?: string
  qualifiers?: Qualifiers
  result?: MaturityResult
}

export async function POST(request: Request) {
  let body: ReportRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.submissionId || typeof body.submissionId !== 'string') {
    return NextResponse.json({ error: 'Valid submissionId required' }, { status: 400 })
  }
  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!body.qualifiers || !body.result) {
    return NextResponse.json({ error: 'Valid qualifiers and result required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[maturity-score-report] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let pdfBytes: Uint8Array
  try {
    pdfBytes = generateMaturityScorePDF({
      qualifiers: body.qualifiers,
      dimensionScores: body.result.dimensionScores,
      overallScore: body.result.overallScore,
      weakest: body.result.weakest,
      aiAnswers: body.result.aiAnswers ?? {},
      aiReadinessScore: body.result.aiReadinessScore ?? 0,
      aiReadinessStage: body.result.aiReadinessStage ?? aiStageForScore(body.result.aiReadinessScore ?? 0),
    })
  } catch (err) {
    console.error('[maturity-score-report] PDF generation failed:', err)
    return NextResponse.json({ error: 'Could not generate PDF' }, { status: 500 })
  }

  const dateStamp = new Date().toISOString().slice(0, 10)
  const filename = `maturity-score-report-${body.result.tier.id}-${dateStamp}.pdf`

  let pdfUrl: string
  try {
    const { error: uploadError } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filename, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(filename)
    pdfUrl = data.publicUrl
  } catch (err) {
    console.error('[maturity-score-report] Supabase upload failed:', err)
    return NextResponse.json({ error: 'Could not store PDF' }, { status: 502 })
  }

  // The PDF is already generated and stored at this point — that's the
  // actual deliverable, and the download link works regardless of what
  // happens below. Saving the email on the submission record and
  // subscribing (for tags + future nurture sequences) are
  // secondary, so neither should block or fail the response the visitor
  // is waiting on.

  const { error: updateError } = await supabase
    .from('maturity_score_submissions')
    .update({ email: body.email, pdf_url: pdfUrl })
    .eq('id', body.submissionId)

  if (updateError) {
    console.error('[maturity-score-report] update failed:', updateError)
  }

  const weakestDimension = body.result.weakest[0]?.dimensionId ?? ''

  try {
    const subscribeResult = await subscribe({
      email: body.email,
      source: 'maturity-score',
      fields: {
        role: body.qualifiers.role,
        stage: body.qualifiers.stage,
        funding: body.qualifiers.funding,
        maturity_tier: body.result.tier.id,
        weakest_dimension: weakestDimension,
        maturity_score_pdf_url: pdfUrl,
        ai_readiness_stage: body.result.aiReadinessStage?.id ?? '',
      },
    })
    if (!subscribeResult.ok) {
      console.error('[maturity-score-report] subscribe failed:', subscribeResult.detail)
    }
  } catch (err) {
    console.error('[maturity-score-report] subscribe threw:', err)
  }

  return NextResponse.json({ success: true, url: pdfUrl })
}
