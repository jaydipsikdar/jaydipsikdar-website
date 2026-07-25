import {
  DIMENSIONS,
  QUESTIONS,
  questionsForDimension,
  tierForScore,
  type DimensionId,
  type Qualifiers,
  type Tier,
} from './maturityScoreData'

export type Answers = Record<string, number>

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

export interface MaturityResult {
  answers: Answers
  dimensionScores: DimensionScore[]
  overallScore: number
  tier: Tier
  weakest: DimensionScore[]
}

export function computeResult(answers: Answers): MaturityResult {
  const dimensionScores = scoreAllDimensions(answers)
  const overallScore = scoreOverall(dimensionScores)
  return {
    answers,
    dimensionScores,
    overallScore,
    tier: tierForScore(overallScore),
    weakest: weakestDimensions(dimensionScores),
  }
}

export function buildMailerLiteTags(qualifiers: Qualifiers, result: MaturityResult): string[] {
  const weakestDimensionId = result.weakest[0]?.dimensionId
  return [
    `role:${qualifiers.role}`,
    `stage:${qualifiers.stage}`,
    `funding:${qualifiers.funding}`,
    `maturity:${result.tier.id}`,
    ...(weakestDimensionId ? [`weakest:${weakestDimensionId}`] : []),
  ]
}
