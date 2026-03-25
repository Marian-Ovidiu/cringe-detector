import { computed, reactive } from 'vue'
import { memoryMockLines } from '../data/memoryMock'

type MemoryContext = 'home' | 'quiz' | 'result'

interface MemoryState {
  quizStarts: number
  quizRestarts: number
  shareAttempts: number
  fakeButtonClicks: number
  ctaClicks: number
  spamClickBursts: number
  hesitationCount: number
  fastAnswerCount: number
  ctaById: Record<string, number>
  lastClickAtByTarget: Record<string, number>
  clickStreakByTarget: Record<string, number>
}

const STORAGE_KEY = 'cringe-detector-memory-mock'

function safeRead(): Partial<MemoryState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<MemoryState>) : null
  } catch {
    return null
  }
}

function createDefaultState(): MemoryState {
  return {
    quizStarts: 0,
    quizRestarts: 0,
    shareAttempts: 0,
    fakeButtonClicks: 0,
    ctaClicks: 0,
    spamClickBursts: 0,
    hesitationCount: 0,
    fastAnswerCount: 0,
    ctaById: {},
    lastClickAtByTarget: {},
    clickStreakByTarget: {},
  }
}

const initial = { ...createDefaultState(), ...safeRead() }

const state = reactive<MemoryState>({
  ...createDefaultState(),
  ...initial,
  ctaById: initial.ctaById ?? {},
  lastClickAtByTarget: initial.lastClickAtByTarget ?? {},
  clickStreakByTarget: initial.clickStreakByTarget ?? {},
})

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function incrementCounter(key: keyof Omit<MemoryState, 'ctaById' | 'lastClickAtByTarget' | 'clickStreakByTarget'>): void {
  state[key] += 1
  persist()
}

function chooseContextLine(context: MemoryContext): string {
  if (context === 'home') {
    if (state.quizStarts >= 2) {
      return 'di nuovo qui?'
    }
    if (state.shareAttempts >= 2) {
      return 'hai gia fatto peggio'
    }
    return state.fakeButtonClicks >= 2 ? 'Buonsalve' : ''
  }

  if (context === 'quiz') {
    if (state.quizRestarts >= 2) {
      return 'So cosa hai votato al Referendum'
    }
    if (state.hesitationCount >= 2) {
      return 'Salve, ho appena farcito una napoletana'
    }
    if (state.spamClickBursts >= 1) {
      return 'IO SONO BATMAN'
    }
    return ''
  }

  if (state.shareAttempts >= 2) {
    return 'hai gia fatto peggio'
  }
  if (state.fakeButtonClicks >= 1) {
    return 'Buonsalve'
  }
  return state.quizRestarts >= 1 ? 'di nuovo qui?' : ''
}

export function useMemoryMock() {
  function trackQuizStart(): void {
    state.quizStarts += 1
    if (state.quizStarts > 1) {
      state.quizRestarts += 1
    }
    persist()
  }

  function trackCtaClick(ctaId: string): void {
    state.ctaClicks += 1
    state.ctaById[ctaId] = (state.ctaById[ctaId] ?? 0) + 1
    persist()
  }

  function trackShareAttempt(): void {
    incrementCounter('shareAttempts')
  }

  function trackFakeButtonClick(): void {
    incrementCounter('fakeButtonClicks')
  }

  function trackAnswerTiming(deltaMs: number): void {
    if (deltaMs >= 7000) {
      incrementCounter('hesitationCount')
      return
    }

    if (deltaMs <= 1200) {
      incrementCounter('fastAnswerCount')
    }
  }

  function trackSpamClick(targetId: string): void {
    const now = Date.now()
    const last = state.lastClickAtByTarget[targetId] ?? 0
    const withinBurstWindow = now - last <= 900
    const nextStreak = withinBurstWindow ? (state.clickStreakByTarget[targetId] ?? 0) + 1 : 1

    state.lastClickAtByTarget[targetId] = now
    state.clickStreakByTarget[targetId] = nextStreak

    if (nextStreak >= 3) {
      state.spamClickBursts += 1
      state.clickStreakByTarget[targetId] = 0
    }

    persist()
  }

  function randomMemoryLine(): string {
    return memoryMockLines[Math.floor(Math.random() * memoryMockLines.length)] ?? 'di nuovo qui?'
  }

  function getContextLine(context: MemoryContext): string {
    const selected = chooseContextLine(context)
    if (selected) {
      return selected
    }

    return state.ctaClicks >= 4 ? randomMemoryLine() : ''
  }

  const hasMemory = computed(
    () =>
      state.quizStarts > 1 ||
      state.shareAttempts > 0 ||
      state.fakeButtonClicks > 0 ||
      state.spamClickBursts > 0 ||
      state.hesitationCount > 0,
  )

  return {
    state,
    hasMemory,
    trackQuizStart,
    trackCtaClick,
    trackShareAttempt,
    trackFakeButtonClick,
    trackAnswerTiming,
    trackSpamClick,
    getContextLine,
  }
}
