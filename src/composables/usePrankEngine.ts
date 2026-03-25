import { computed, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { prankCategories, prankConfigs } from '../data/pranks'
import type {
  PrankCategory,
  PrankConfig,
  PrankEngineOptions,
  PrankEvent,
  PrankEventType,
  TriggeredPrank,
} from '../types/prank'

const DEFAULT_MAX_CHAOS = 100
const DEFAULT_EVENT_GAIN: Record<PrankEventType, number> = {
  click: 1,
  hover: 0.5,
  answer: 4,
}

interface PrankRuntime {
  triggerCount: number
  lastTriggeredAt: number
}

interface PrankEngineState {
  chaosLevel: Ref<number>
  maxChaos: number
  rng: () => number
  eventGain: Record<PrankEventType, number>
  categoryEnabled: Record<PrankCategory, boolean>
  prankEnabled: Record<string, boolean>
  prankRuntime: Record<string, PrankRuntime>
  triggerHistory: Ref<TriggeredPrank[]>
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function createDefaultCategoryState(): Record<PrankCategory, boolean> {
  return prankCategories.reduce(
    (acc, category) => {
      acc[category] = true
      return acc
    },
    {} as Record<PrankCategory, boolean>,
  )
}

function createDefaultPrankState(configs: PrankConfig[]): Record<string, boolean> {
  return configs.reduce(
    (acc, prank) => {
      acc[prank.id] = prank.enabledByDefault
      return acc
    },
    {} as Record<string, boolean>,
  )
}

function createRuntimeState(configs: PrankConfig[]): Record<string, PrankRuntime> {
  return configs.reduce(
    (acc, prank) => {
      acc[prank.id] = { triggerCount: 0, lastTriggeredAt: 0 }
      return acc
    },
    {} as Record<string, PrankRuntime>,
  )
}

const sharedState: PrankEngineState = {
  chaosLevel: ref(0),
  maxChaos: DEFAULT_MAX_CHAOS,
  rng: Math.random,
  eventGain: { ...DEFAULT_EVENT_GAIN },
  categoryEnabled: reactive(createDefaultCategoryState()),
  prankEnabled: reactive(createDefaultPrankState(prankConfigs)),
  prankRuntime: reactive(createRuntimeState(prankConfigs)),
  triggerHistory: ref([]),
}

function makeEvent(type: PrankEventType, event?: Partial<PrankEvent>): PrankEvent {
  return {
    type,
    timestamp: Date.now(),
    targetId: event?.targetId,
    answerId: event?.answerId,
    questionId: event?.questionId,
  }
}

function canTrigger(prank: PrankConfig, event: PrankEvent, chaos: number): boolean {
  if (!sharedState.prankEnabled[prank.id]) {
    return false
  }

  if (!sharedState.categoryEnabled[prank.category]) {
    return false
  }

  if (!prank.allowedEvents.includes(event.type)) {
    return false
  }

  if (chaos < prank.minChaos) {
    return false
  }

  const runtime = sharedState.prankRuntime[prank.id]
  if (event.timestamp - runtime.lastTriggeredAt < prank.cooldownMs) {
    return false
  }

  if (typeof prank.maxTriggers === 'number' && runtime.triggerCount >= prank.maxTriggers) {
    return false
  }

  return true
}

function computeChance(prank: PrankConfig, chaos: number): number {
  const chaosRatio = clamp(chaos / sharedState.maxChaos, 0, 1)
  return clamp(prank.baseChance + prank.chaosScale * chaosRatio, 0, 1)
}

function evaluate(event: PrankEvent): TriggeredPrank | null {
  const currentChaos = sharedState.chaosLevel.value
  const candidates = prankConfigs.filter((prank) => canTrigger(prank, event, currentChaos))
  if (candidates.length === 0) {
    return null
  }

  let best: { prank: PrankConfig; score: number } | null = null
  for (const prank of candidates) {
    const score = computeChance(prank, currentChaos)
    if (sharedState.rng() > score) {
      continue
    }

    if (!best || score > best.score) {
      best = { prank, score }
    }
  }

  if (!best) {
    return null
  }

  const runtime = sharedState.prankRuntime[best.prank.id]
  runtime.lastTriggeredAt = event.timestamp
  runtime.triggerCount += 1

  const output: TriggeredPrank = {
    prankId: best.prank.id,
    category: best.prank.category,
    eventType: event.type,
    triggeredAt: event.timestamp,
    chaosLevel: currentChaos,
  }
  sharedState.triggerHistory.value.unshift(output)
  sharedState.triggerHistory.value = sharedState.triggerHistory.value.slice(0, 20)

  return output
}

export function usePrankEngine(options?: PrankEngineOptions) {
  if (options) {
    if (typeof options.initialChaos === 'number') {
      sharedState.chaosLevel.value = clamp(options.initialChaos, 0, sharedState.maxChaos)
    }

    if (typeof options.maxChaos === 'number' && Number.isFinite(options.maxChaos) && options.maxChaos > 0) {
      sharedState.maxChaos = options.maxChaos
      sharedState.chaosLevel.value = clamp(sharedState.chaosLevel.value, 0, sharedState.maxChaos)
    }

    if (typeof options.rng === 'function') {
      sharedState.rng = options.rng
    }

    if (options.perEventChaosGain) {
      Object.assign(sharedState.eventGain, options.perEventChaosGain)
    }

    if (options.initialCategoryState) {
      Object.assign(sharedState.categoryEnabled, options.initialCategoryState)
    }
  }

  function addChaos(delta: number): void {
    const nextChaos = sharedState.chaosLevel.value + delta
    sharedState.chaosLevel.value = clamp(nextChaos, 0, sharedState.maxChaos)
  }

  function setChaosLevel(level: number): void {
    sharedState.chaosLevel.value = clamp(level, 0, sharedState.maxChaos)
  }

  function setCategoryEnabled(category: PrankCategory, enabled: boolean): void {
    sharedState.categoryEnabled[category] = enabled
  }

  function setPrankEnabled(prankId: string, enabled: boolean): void {
    if (prankId in sharedState.prankEnabled) {
      sharedState.prankEnabled[prankId] = enabled
    }
  }

  function registerEvent(type: PrankEventType, event?: Partial<PrankEvent>): TriggeredPrank | null {
    const payload = makeEvent(type, event)
    addChaos(sharedState.eventGain[type] ?? 0)
    return evaluate(payload)
  }

  function registerClick(event?: Omit<PrankEvent, 'type' | 'timestamp'>): TriggeredPrank | null {
    return registerEvent('click', event)
  }

  function registerHover(event?: Omit<PrankEvent, 'type' | 'timestamp'>): TriggeredPrank | null {
    return registerEvent('hover', event)
  }

  function registerAnswer(event?: Omit<PrankEvent, 'type' | 'timestamp'>): TriggeredPrank | null {
    return registerEvent('answer', event)
  }

  function resetPrankState(): void {
    sharedState.chaosLevel.value = 0
    sharedState.triggerHistory.value = []

    for (const runtime of Object.values(sharedState.prankRuntime)) {
      runtime.lastTriggeredAt = 0
      runtime.triggerCount = 0
    }
  }

  function resetToggles(): void {
    Object.assign(sharedState.categoryEnabled, createDefaultCategoryState())
    Object.assign(sharedState.prankEnabled, createDefaultPrankState(prankConfigs))
  }

  const enabledCategories = computed(() =>
    prankCategories.filter((category) => sharedState.categoryEnabled[category]),
  )
  const enabledPranks = computed(() =>
    prankConfigs.filter((prank) => sharedState.prankEnabled[prank.id] && sharedState.categoryEnabled[prank.category]),
  )

  return {
    chaosLevel: sharedState.chaosLevel,
    triggerHistory: sharedState.triggerHistory,
    enabledCategories,
    enabledPranks,
    categoryEnabled: sharedState.categoryEnabled,
    prankEnabled: sharedState.prankEnabled,
    prankConfigs,
    prankCategories,
    addChaos,
    setChaosLevel,
    setCategoryEnabled,
    setPrankEnabled,
    registerEvent,
    registerClick,
    registerHover,
    registerAnswer,
    resetPrankState,
    resetToggles,
  }
}
