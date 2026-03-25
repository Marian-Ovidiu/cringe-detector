import { reactive } from 'vue'
import { prankTuning } from '../data/prankTuning'

export interface ComboDecision {
  id: string
  screenKey: string
  labelOverride: string
  floatingBursts: number
  roastBursts: number
}

interface ComboRuntime {
  count: number
  lastAt: number
}

interface ComboSettings {
  minChaos: number
  baseChance: number
  chaosBonusMax: number
  cooldownMs: number
  maxPerScreen: number
  resetWindowMs: number
}

const comboPool: ComboDecision[] = [
  {
    id: 'bro_burst',
    screenKey: '',
    labelOverride: 'BRO',
    floatingBursts: 1,
    roastBursts: 1,
  },
  {
    id: 'nice_try_stack',
    screenKey: '',
    labelOverride: 'nice try',
    floatingBursts: 2,
    roastBursts: 1,
  },
  {
    id: 'cazzo_guardi_pop',
    screenKey: '',
    labelOverride: 'cazzo guardi',
    floatingBursts: 1,
    roastBursts: 2,
  },
  {
    id: 'osserva_glitch',
    screenKey: '',
    labelOverride: 'stasera qualcuno ti osserva',
    floatingBursts: 1,
    roastBursts: 1,
  },
  {
    id: 'hahahha_flash',
    screenKey: '',
    labelOverride: 'HAHAHHA',
    floatingBursts: 2,
    roastBursts: 1,
  },
]

const runtimeByScreen = reactive<Record<string, ComboRuntime>>({})

const settings: ComboSettings = {
  ...prankTuning.combo,
}

function ensureRuntime(screenKey: string): ComboRuntime {
  if (!runtimeByScreen[screenKey]) {
    runtimeByScreen[screenKey] = {
      count: 0,
      lastAt: 0,
    }
  }

  return runtimeByScreen[screenKey]
}

function pickRandomCombo(screenKey: string): ComboDecision {
  const picked = comboPool[Math.floor(Math.random() * comboPool.length)] ?? comboPool[0]
  return { ...picked, screenKey }
}

export function useComboMode() {
  function maybeTriggerCombo(screenKey: string, chaosLevel: number): ComboDecision | null {
    const runtime = ensureRuntime(screenKey)
    const now = Date.now()

    if (runtime.count > 0 && now - runtime.lastAt > settings.resetWindowMs) {
      runtime.count = 0
    }

    if (chaosLevel < settings.minChaos) {
      return null
    }

    if (runtime.count >= settings.maxPerScreen) {
      return null
    }

    if (now - runtime.lastAt < settings.cooldownMs) {
      return null
    }

    const chaosBonus = Math.min(settings.chaosBonusMax, Math.max(0, (chaosLevel - settings.minChaos) / 400))
    const chance = settings.baseChance + chaosBonus
    if (Math.random() >= chance) {
      return null
    }

    runtime.count += 1
    runtime.lastAt = now
    return pickRandomCombo(screenKey)
  }

  function resetScreenCombo(screenKey: string): void {
    runtimeByScreen[screenKey] = {
      count: 0,
      lastAt: 0,
    }
  }

  return {
    settings,
    maybeTriggerCombo,
    resetScreenCombo,
  }
}
