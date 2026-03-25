import { memes as defaultMemes } from '../data/memes'
import type { Answer, Meme, TagWeights } from '../types/quiz'

export interface MatchOutput {
  meme: Meme
  percentage: number
}

export function sumAnswerTags(selectedAnswers: Answer[]): TagWeights {
  const totals: TagWeights = {}

  for (const answer of selectedAnswers) {
    for (const [tag, weight] of Object.entries(answer.tagWeights)) {
      totals[tag] = (totals[tag] ?? 0) + weight
    }
  }

  return totals
}

function getMemeScore(answerTags: TagWeights, meme: Meme): number {
  let score = 0

  for (const [tag, totalWeight] of Object.entries(answerTags)) {
    const affinity = meme.tagAffinities[tag] ?? 0
    score += totalWeight * affinity
  }

  return score
}

function getMatchPercentage(score: number, answerTags: TagWeights): number {
  const maxScore = Object.values(answerTags).reduce((sum, value) => sum + value, 0)

  if (maxScore <= 0) {
    return 0
  }

  const percentage = Math.round((score / maxScore) * 100)
  return Math.max(0, Math.min(100, percentage))
}

export function matchBestMeme(
  selectedAnswers: Answer[],
  memePool: Meme[] = defaultMemes,
): MatchOutput {
  if (memePool.length === 0) {
    throw new Error('Cannot match meme: meme pool is empty.')
  }

  const answerTags = sumAnswerTags(selectedAnswers)
  let bestMeme = memePool[0]
  let bestScore = getMemeScore(answerTags, bestMeme)

  for (let i = 1; i < memePool.length; i += 1) {
    const candidate = memePool[i]
    const candidateScore = getMemeScore(answerTags, candidate)

    // Deterministic tie-breaker: keep the first meme in dataset order.
    if (candidateScore > bestScore) {
      bestMeme = candidate
      bestScore = candidateScore
    }
  }

  return {
    meme: bestMeme,
    percentage: getMatchPercentage(bestScore, answerTags),
  }
}
