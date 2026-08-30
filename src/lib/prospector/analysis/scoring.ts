import type { ScoreCategory } from '../types'

interface ScoreInputs {
  score_pain:         number
  score_intention:    number
  score_fit:          number
  score_contactability:number
  score_freshness:    number
  score_willingness:  number
  source_bonus:       number
}

interface ScoreResult {
  score:          number
  score_category: ScoreCategory
}

export function computeScore(inputs: ScoreInputs): ScoreResult {
  const base =
    inputs.score_pain          * 0.25 +
    inputs.score_intention     * 0.25 +
    inputs.score_fit           * 0.20 +
    inputs.score_contactability* 0.15 +
    inputs.score_freshness     * 0.10 +
    inputs.score_willingness   * 0.05

  const score = Math.min(100, Math.max(0, Math.round(base + inputs.source_bonus)))

  let score_category: ScoreCategory
  if (score >= 85) score_category = 'excellent'
  else if (score >= 70) score_category = 'good'
  else if (score >= 50) score_category = 'possible'
  else score_category = 'low'

  return { score, score_category }
}
