import { ref } from 'vue'
import { roastMessages } from '../data/roasts'
import { prankTuning } from '../data/prankTuning'
import type { TriggeredPrank } from '../types/prank'

export type RoastInterruptStyle = 'toast' | 'banner' | 'bubble'
export type RoastTriggerReason = 'interaction' | 'fast_answer' | 'question_change' | 'result_reveal' | 'hover' | 'prank' | 'combo'

export interface RoastInterruptItem {
  id: string
  text: string
  style: RoastInterruptStyle
  createdAt: number
  durationMs: number
}

interface RoastInterruptOptions {
  maxActive?: number
}

let nextInterruptId = 0

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T
}

export function useRoastInterrupt(options?: RoastInterruptOptions) {
  const maxActive = options?.maxActive ?? prankTuning.roast.maxActive
  const interrupts = ref<RoastInterruptItem[]>([])
  const interactionCount = ref(0)

  function pushInterrupt(reason: RoastTriggerReason): void {
    const stylePool: RoastInterruptStyle[] =
      reason === 'result_reveal' ? ['banner', 'bubble'] : reason === 'hover' ? ['bubble', 'toast'] : ['toast', 'banner', 'bubble']

    const item: RoastInterruptItem = {
      id: `roast-${nextInterruptId++}`,
      text: pickOne(roastMessages),
      style: pickOne(stylePool),
      createdAt: Date.now(),
      durationMs: prankTuning.roast.autoDismissMs,
    }

    const next = [...interrupts.value, item]
    interrupts.value = next.slice(Math.max(0, next.length - maxActive))

    window.setTimeout(() => {
      interrupts.value = interrupts.value.filter((entry) => entry.id !== item.id)
    }, prankTuning.roast.autoDismissMs)
  }

  function maybePush(reason: RoastTriggerReason, chance: number): void {
    if (Math.random() < chance) {
      pushInterrupt(reason)
    }
  }

  function registerInteraction(): void {
    interactionCount.value += 1
    const cadence =
      prankTuning.roast.interactionEvery.min +
      Math.floor(Math.random() * (prankTuning.roast.interactionEvery.max - prankTuning.roast.interactionEvery.min + 1))
    const shouldFire = interactionCount.value > 1 && interactionCount.value % cadence === 0
    if (shouldFire) {
      pushInterrupt('interaction')
    }
  }

  function registerFastAnswer(deltaMs: number): void {
    if (deltaMs <= prankTuning.roast.fastAnswerThresholdMs) {
      maybePush('fast_answer', prankTuning.roast.triggerChanceByReason.fast_answer)
    }
  }

  function registerQuestionChange(): void {
    maybePush('question_change', prankTuning.roast.triggerChanceByReason.question_change)
  }

  function registerResultReveal(): void {
    pushInterrupt('result_reveal')
  }

  function registerHover(): void {
    maybePush('hover', prankTuning.roast.triggerChanceByReason.hover)
  }

  function handlePrankTrigger(triggered: TriggeredPrank | null): void {
    if (!triggered) {
      return
    }

    maybePush('prank', prankTuning.roast.triggerChanceByReason.prank)
  }

  function triggerComboInterrupt(): void {
    pushInterrupt('combo')
  }

  return {
    interrupts,
    registerInteraction,
    registerFastAnswer,
    registerQuestionChange,
    registerResultReveal,
    registerHover,
    handlePrankTrigger,
    triggerComboInterrupt,
  }
}
