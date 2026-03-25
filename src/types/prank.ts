export type PrankEventType = 'click' | 'hover' | 'answer'

export type PrankCategory = 'visual' | 'copy' | 'interaction' | 'sound' | 'meta'

export interface PrankEvent {
  type: PrankEventType
  timestamp: number
  targetId?: string
  answerId?: string
  questionId?: string
}

export interface PrankConfig {
  id: string
  category: PrankCategory
  label: string
  enabledByDefault: boolean
  allowedEvents: PrankEventType[]
  minChaos: number
  baseChance: number
  chaosScale: number
  cooldownMs: number
  maxTriggers?: number
}

export interface TriggeredPrank {
  prankId: string
  category: PrankCategory
  eventType: PrankEventType
  triggeredAt: number
  chaosLevel: number
}

export interface PrankEngineOptions {
  initialChaos?: number
  maxChaos?: number
  rng?: () => number
  perEventChaosGain?: Partial<Record<PrankEventType, number>>
  initialCategoryState?: Partial<Record<PrankCategory, boolean>>
}
