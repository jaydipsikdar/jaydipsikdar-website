import {
  DIMENSIONS,
  QUESTIONS,
  AI_QUESTIONS,
  AI_WORKFLOWS,
  questionsForDimension,
  tierForScore,
  aiStageForScore,
  type DimensionId,
  type Qualifiers,
  type Tier,
  type AIQuestionId,
  type AIStage,
  type AIWorkflowId,
} from './maturityScoreData'

export type Answers = Record<string, number>
export type AIAnswers = Partial<Record<AIQuestionId, number>>

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function scoreDimension(dimensionId: DimensionId, answers: Answers): number {
  const questions = questionsForDimension(dimensionId)
  const scores = questions.map((q) => answers[q.id]).filter((s): s is number => typeof s === 'number')
  if (scores.length === 0) return 0
  return round1(scores.reduce((sum, s) => sum + s, 0) / scores.length)
}

export interface DimensionScore {
  dimensionId: DimensionId
  score: number
}

export function scoreAllDimensions(answers: Answers): DimensionScore[] {
  return DIMENSIONS.map((d) => ({ dimensionId: d.id, score: scoreDimension(d.id, answers) }))
}

export function scoreOverall(dimensionScores: DimensionScore[]): number {
  if (dimensionScores.length === 0) return 0
  return round1(dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length)
}

export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((q) => typeof answers[q.id] === 'number')
}

export function answeredCount(answers: Answers): number {
  return QUESTIONS.filter((q) => typeof answers[q.id] === 'number').length
}

export function weakestDimensions(dimensionScores: DimensionScore[], count = 3): DimensionScore[] {
  return [...dimensionScores].sort((a, b) => a.score - b.score).slice(0, count)
}

// ── AI readiness overlay ──
// Non-scored diagnostic layer: averages AQ1-AQ5, does not affect
// dimensionScores or overallScore. See ai-marketing-maturity-framework.md.

export function isAIComplete(aiAnswers: AIAnswers): boolean {
  return AI_QUESTIONS.every((q) => typeof aiAnswers[q.id] === 'number')
}

export function aiAnsweredCount(aiAnswers: AIAnswers): number {
  return AI_QUESTIONS.filter((q) => typeof aiAnswers[q.id] === 'number').length
}

export function scoreAIReadiness(aiAnswers: AIAnswers): number {
  const scores = AI_QUESTIONS.map((q) => aiAnswers[q.id]).filter((s): s is number => typeof s === 'number')
  if (scores.length === 0) return 0
  return round1(scores.reduce((sum, s) => sum + s, 0) / scores.length)
}

export interface AIWorkflowEstimate {
  workflowId: AIWorkflowId
  score: number
  stage: AIStage
}

// Directional inference from 5 cross-cutting questions, not a precise
// per-workflow measurement (see framework doc). AQ1 sets the baseline
// across all 6 workflows; AQ2 adjusts Campaign Execution; AQ3 adjusts
// Analytics & Optimization and Target & Segmentation; AQ4 adjusts
// Operations and Campaign Strategy (its process-maturity modifier applies
// to the workflows without a dedicated question); AQ5 is an overall
// capability modifier blended into every estimate.
export function estimateAIWorkflowAdoption(aiAnswers: AIAnswers): AIWorkflowEstimate[] {
  const aq1 = aiAnswers.aq1 ?? 0
  const aq2 = aiAnswers.aq2 ?? 0
  const aq3 = aiAnswers.aq3 ?? 0
  const aq4 = aiAnswers.aq4 ?? 0
  const aq5 = aiAnswers.aq5 ?? 0

  const specific: Record<AIWorkflowId, number> = {
    'target-segmentation': (aq1 + aq3) / 2,
    'campaign-strategy': (aq1 + aq4) / 2,
    'campaign-execution': (aq1 + aq2) / 2,
    distribution: aq1,
    operations: (aq1 + aq4) / 2,
    'analytics-optimization': (aq1 + aq3) / 2,
  }

  return AI_WORKFLOWS.map((w) => {
    const blended = specific[w.id] * 0.8 + aq5 * 0.2
    const score = round1(Math.min(5, Math.max(1, blended)))
    return { workflowId: w.id, score, stage: aiStageForScore(score) }
  })
}

export interface MaturityResult {
  answers: Answers
  dimensionScores: DimensionScore[]
  overallScore: number
  tier: Tier
  weakest: DimensionScore[]
  aiAnswers: AIAnswers
  aiReadinessScore: number
  aiReadinessStage: AIStage
}

export function computeResult(answers: Answers, aiAnswers: AIAnswers = {}): MaturityResult {
  const dimensionScores = scoreAllDimensions(answers)
  const overallScore = scoreOverall(dimensionScores)
  const aiReadinessScore = scoreAIReadiness(aiAnswers)
  return {
    answers,
    dimensionScores,
    overallScore,
    tier: tierForScore(overallScore),
    weakest: weakestDimensions(dimensionScores),
    aiAnswers,
    aiReadinessScore,
    aiReadinessStage: aiStageForScore(aiReadinessScore),
  }
}

export function buildSubscriberTags(qualifiers: Qualifiers, result: MaturityResult): string[] {
  const weakestDimensionId = result.weakest[0]?.dimensionId
  return [
    `role:${qualifiers.role}`,
    `stage:${qualifiers.stage}`,
    `funding:${qualifiers.funding}`,
    `maturity:${result.tier.id}`,
    ...(weakestDimensionId ? [`weakest:${weakestDimensionId}`] : []),
    `ai-readiness:${result.aiReadinessStage.id}`,
  ]
}
