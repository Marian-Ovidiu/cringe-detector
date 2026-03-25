import type { Answer } from '../types/quiz'
import type { MatchOutput } from '../engine/matcher'

const ANSWERS_KEY = 'cringe-detector-answers'
const RESULT_KEY = 'cringe-detector-result'

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function isAnswer(payload: unknown): payload is Answer {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as Answer
  const weights = candidate.tagWeights as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    !!candidate.tagWeights &&
    typeof candidate.tagWeights === 'object' &&
    Object.values(weights).every((value) => typeof value === 'number' && Number.isFinite(value))
  )
}

function isMatchOutput(payload: unknown): payload is MatchOutput {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as MatchOutput
  return (
    typeof candidate.percentage === 'number' &&
    Number.isFinite(candidate.percentage) &&
    candidate.percentage >= 0 &&
    candidate.percentage <= 100 &&
    !!candidate.meme &&
    typeof candidate.meme.title === 'string' &&
    typeof candidate.meme.imageUrl === 'string' &&
    typeof candidate.meme.roast === 'string'
  )
}

export function useQuizSession() {
  function loadAnswers(): Answer[] {
    const payload = readJson<unknown>(ANSWERS_KEY)
    if (!Array.isArray(payload)) {
      return []
    }

    return payload.filter((item): item is Answer => isAnswer(item))
  }

  function saveAnswers(answers: Answer[]): void {
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
  }

  function clearAnswers(): void {
    sessionStorage.removeItem(ANSWERS_KEY)
  }

  function loadResult(): MatchOutput | null {
    const payload = readJson<unknown>(RESULT_KEY)
    return isMatchOutput(payload) ? payload : null
  }

  function saveResult(result: MatchOutput): void {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
  }

  function clearResult(): void {
    sessionStorage.removeItem(RESULT_KEY)
  }

  return {
    loadAnswers,
    saveAnswers,
    clearAnswers,
    loadResult,
    saveResult,
    clearResult,
  }
}
