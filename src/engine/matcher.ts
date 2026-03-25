import { memes as defaultMemes } from '../data/memes'
import type { Answer, Meme, TagWeights } from '../types/quiz'

export interface MatchOutput {
  meme: Meme
  percentage: number
}

interface ScoredMeme {
  meme: Meme
  score: number
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
  randomFn: () => number = Math.random,
): MatchOutput {
  if (memePool.length === 0) {
    throw new Error('Cannot match meme: meme pool is empty.')
  }

  const answerTags = sumAnswerTags(selectedAnswers)
  const scoredMemes: ScoredMeme[] = memePool.map((meme) => ({
    meme,
    score: getMemeScore(answerTags, meme),
  }))

  scoredMemes.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score
    }

    // Deterministic tie-breaker: keep dataset order.
    return memePool.indexOf(left.meme) - memePool.indexOf(right.meme)
  })

  const topMatches = scoredMemes.slice(0, 3)
  const bestMatch = topMatches[0]

  const roll = randomFn()
  let selected = bestMatch

  if (roll < 0.05) {
    const legendaryPick = topMatches.find((item) => item.meme.rarity === 'legendary')
    if (legendaryPick) {
      selected = legendaryPick
    }
  } else if (roll < 0.30) {
    const rarePick = topMatches.find((item) => item.meme.rarity === 'rare')
    if (rarePick) {
      selected = rarePick
    }
  }

  return {
    meme: selected.meme,
    percentage: getMatchPercentage(selected.score, answerTags),
  }
}
