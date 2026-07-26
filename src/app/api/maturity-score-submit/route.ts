import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DIMENSIONS } from '@/lib/maturityScoreData'
import type { Qualifiers } from '@/lib/maturityScoreData'
import type { Answers, AIAnswers, MaturityResult } from '@/lib/maturityScoring'

export const runtime = 'nodejs'

interface SubmitRequestBody {
  qualifiers?: Qualifiers
  answers?: Answers
  aiAnswers?: AIAnswers
  result?: MaturityResult
}

function isValidQualifiers(q: unknown): q is Qualifiers {
  if (!q || typeof q !== 'object') return false
  const v = q as Partial<Qualifiers>
  return typeof v.role === 'string' && typeof v.stage === 'string' && typeof v.funding === 'string'
}

function isValidResult(r: unknown): r is MaturityResult {
  if (!r || typeof r !== 'object') return false
  const v = r as Partial<MaturityResult>
  return (
    Array.isArray(v.dimensionScores) &&
    v.dimensionScores.length === DIMENSIONS.length &&
    typeof v.overallScore === 'number' &&
    typeof v.tier === 'object' &&
    Array.isArray(v.weakest)
  )
}

export async function POST(request: Request) {
  let body: SubmitRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidQualifiers(body.qualifiers)) {
    return NextResponse.json({ error: 'Valid qualifiers required' }, { status: 400 })
  }
  if (!body.answers || typeof body.answers !== 'object') {
    return NextResponse.json({ error: 'Valid answers required' }, { status: 400 })
  }
  if (!isValidResult(body.result)) {
    return NextResponse.json({ error: 'Valid result required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[maturity-score-submit] Supabase env vars are not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const dimensionScoresMap = Object.fromEntries(
    body.result.dimensionScores.map((d) => [d.dimensionId, d.score])
  )
  const aiAnswers = body.aiAnswers ?? {}

  const { data, error } = await supabase
    .from('maturity_score_submissions')
    .insert({
      role: body.qualifiers.role,
      stage: body.qualifiers.stage,
      funding: body.qualifiers.funding,
      answers: body.answers,
      dimension_scores: dimensionScoresMap,
      overall_score: body.result.overallScore,
      maturity_tier: body.result.tier.id,
      weakest_dimension: body.result.weakest[0]?.dimensionId ?? null,
      ai_readiness_score: body.result.aiReadinessScore ?? null,
      ai_readiness_stage: body.result.aiReadinessStage?.id ?? null,
      aq1: aiAnswers.aq1 ?? null,
      aq2: aiAnswers.aq2 ?? null,
      aq3: aiAnswers.aq3 ?? null,
      aq4: aiAnswers.aq4 ?? null,
      aq5: aiAnswers.aq5 ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[maturity-score-submit] insert failed:', error)
    return NextResponse.json({ error: 'Could not save submission' }, { status: 502 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
