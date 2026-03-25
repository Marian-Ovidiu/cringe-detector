import { ref } from 'vue'
import { floatingMemeBadges, floatingMemeEmojis, floatingMemeLabels } from '../data/floatingMemes'
import { prankTuning } from '../data/prankTuning'
import type { TriggeredPrank } from '../types/prank'

export type FloatingMemeKind = 'emoji' | 'label' | 'badge'
export type FloatingActivity = 'answer' | 'progress' | 'spam_click' | 'prank_trigger'

export interface FloatingMemeItem {
  id: string
  text: string
  kind: FloatingMemeKind
  xPercent: number
  yPercent: number
  driftX: number
  driftY: number
  durationMs: number
  sizeScale: number
}

interface FloatingMemeAttackOptions {
  maxActive?: number
}

const ACTIVITY_CHANCE: Record<FloatingActivity, number> = {
  ...prankTuning.floating.triggerChanceByActivity,
}

let nextId = 0

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function useFloatingMemeAttack(options?: FloatingMemeAttackOptions) {
  const maxActive = options?.maxActive ?? prankTuning.floating.maxActiveByScreen.default
  const items = ref<FloatingMemeItem[]>([])

  function spawn(kind?: FloatingMemeKind): void {
    const selectedKind = kind ?? (pickOne(['emoji', 'label', 'badge']) as FloatingMemeKind)

    let text = ''
    if (selectedKind === 'emoji') {
      text = pickOne(floatingMemeEmojis)
    } else if (selectedKind === 'badge') {
      text = pickOne(floatingMemeBadges)
    } else {
      text = pickOne(floatingMemeLabels)
    }

    const durationMs = Math.round(randomBetween(prankTuning.floating.durationMs.min, prankTuning.floating.durationMs.max))
    const entry: FloatingMemeItem = {
      id: `float-meme-${nextId++}`,
      text,
      kind: selectedKind,
      xPercent: randomBetween(prankTuning.floating.positionPercent.minX, prankTuning.floating.positionPercent.maxX),
      yPercent: randomBetween(prankTuning.floating.positionPercent.minY, prankTuning.floating.positionPercent.maxY),
      driftX: randomBetween(prankTuning.floating.driftPx.minX, prankTuning.floating.driftPx.maxX),
      driftY: randomBetween(prankTuning.floating.driftPx.minY, prankTuning.floating.driftPx.maxY),
      durationMs,
      sizeScale: randomBetween(prankTuning.floating.scale.min, prankTuning.floating.scale.max),
    }

    const next = [...items.value, entry]
    items.value = next.slice(Math.max(0, next.length - maxActive))

    window.setTimeout(() => {
      items.value = items.value.filter((item) => item.id !== entry.id)
    }, durationMs + prankTuning.floating.durationMs.cleanupBuffer)
  }

  function maybeSpawn(activity: FloatingActivity): void {
    if (Math.random() < ACTIVITY_CHANCE[activity]) {
      spawn()
    }
  }

  function registerActivity(activity: FloatingActivity): void {
    maybeSpawn(activity)
  }

  function handlePrankTrigger(triggered: TriggeredPrank | null): void {
    if (!triggered) {
      return
    }

    maybeSpawn('prank_trigger')
  }

  function clearAll(): void {
    items.value = []
  }

  return {
    items,
    spawn,
    maybeSpawn,
    registerActivity,
    handlePrankTrigger,
    clearAll,
  }
}
