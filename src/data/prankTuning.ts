export const prankTuning = {
  floating: {
    maxActiveByScreen: {
      quiz: 4,
      result: 6,
      default: 5,
    },
    triggerChanceByActivity: {
      answer: 0.35,
      progress: 0.28,
      spam_click: 0.46,
      prank_trigger: 0.68,
    },
    durationMs: {
      min: 2200,
      max: 3800,
      cleanupBuffer: 200,
    },
    positionPercent: {
      minX: 6,
      maxX: 80,
      minY: 8,
      maxY: 68,
    },
    driftPx: {
      minX: -16,
      maxX: 16,
      minY: -24,
      maxY: -8,
    },
    scale: {
      min: 0.9,
      max: 1.08,
    },
  },
  roast: {
    maxActive: 2,
    autoDismissMs: 1700,
    fastAnswerThresholdMs: 1800,
    interactionEvery: {
      min: 2,
      max: 3,
    },
    triggerChanceByReason: {
      fast_answer: 0.75,
      question_change: 0.45,
      hover: 0.3,
      prank: 0.55,
    },
  },
  combo: {
    minChaos: 28,
    baseChance: 0.14,
    chaosBonusMax: 0.18,
    cooldownMs: 8500,
    maxPerScreen: 1,
    resetWindowMs: 35000,
  },
  betrayal: {
    releaseAfter: {
      min: 3,
      max: 4,
    },
    chance: {
      early: 0.5,
      late: 0.28,
      engineBoost: 0.3,
      cap: 0.9,
    },
    labelSwapChance: {
      forced: 1,
      withTrigger: 0.5,
      base: 0.25,
    },
    motion: {
      maxEffectsPerInteraction: 2,
      resetDelayMs: 280,
      movePx: {
        x: 14,
        y: 8,
      },
      rotateDeg: 10,
      jumpPx: {
        min: 4,
        max: 9,
      },
      scale: {
        min: 0.92,
        range: 0.04,
      },
    },
  },
  fakeProgress: {
    triggerChance: {
      base: 0.26,
      withPrankTrigger: 0.52,
    },
    minQuestions: 2,
    intensity: {
      backwardScale: 0.42,
      backwardMin: 8,
      backwardRandom: 10,
      forwardMin: 2,
      forwardRandom: 5,
    },
    timingMs: {
      stepOne: 170,
      recover: 540,
    },
  },
} as const
