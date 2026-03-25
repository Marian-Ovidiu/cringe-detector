<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'
import { usePrankEngine } from '../../composables/usePrankEngine'
import { useComboMode } from '../../composables/useComboMode'
import { prankTuning } from '../../data/prankTuning'
import type { TriggeredPrank } from '../../types/prank'
import type { ComboDecision } from '../../composables/useComboMode'

defineOptions({
  inheritAttrs: false,
})

type BetrayalState = 'idle' | 'suspicious' | 'betrayal' | 'settled'

const betrayalLabels = ['no', 'BRO', 'HAHAHHA', 'nice try', 'aspetta', 'non così', 'bel tentativo']

const props = withDefaults(
  defineProps<{
    label: string
    prankId: string
    to?: string
    disabled?: boolean
    releaseAfter?: number
    type?: 'button' | 'submit'
    comboScreen?: string
  }>(),
  {
    to: undefined,
    disabled: false,
    releaseAfter: undefined,
    type: 'button',
    comboScreen: undefined,
  },
)

const emit = defineEmits<{
  attempt: []
  combo: [payload: ComboDecision]
  action: []
}>()

const attrs = useAttrs()
const prankEngine = usePrankEngine()
const comboMode = useComboMode()

const state = ref<BetrayalState>('idle')
const attempts = ref(0)
const hoverCount = ref(0)
const labelIndex = ref(0)
const currentLabel = ref(props.label)
const releaseAt = ref(
  props.releaseAfter ??
    (Math.random() < 0.5 ? prankTuning.betrayal.releaseAfter.min : prankTuning.betrayal.releaseAfter.max),
)

const moveX = ref(0)
const moveY = ref(0)
const rotateDeg = ref(0)
const scale = ref(1)

const transformStyle = computed(() => ({
  transform: `translate(${moveX.value}px, ${moveY.value}px) rotate(${rotateDeg.value}deg) scale(${scale.value})`,
}))

const isSettled = computed(() => state.value === 'settled' || attempts.value >= releaseAt.value)

function rearmCycle(): void {
  attempts.value = 0
  hoverCount.value = 0
  state.value = 'idle'
  currentLabel.value = props.label
  moveX.value = 0
  moveY.value = 0
  rotateDeg.value = 0
  scale.value = 1
  releaseAt.value =
    props.releaseAfter ??
    (Math.random() < 0.5 ? prankTuning.betrayal.releaseAfter.min : prankTuning.betrayal.releaseAfter.max)
}

function resetMotion(delay = prankTuning.betrayal.motion.resetDelayMs): void {
  window.setTimeout(() => {
    moveX.value = 0
    moveY.value = 0
    rotateDeg.value = 0
    scale.value = 1
    if (!isSettled.value) {
      state.value = 'suspicious'
    }
  }, delay)
}

function setNextBetrayalLabel(): void {
  const label = betrayalLabels[labelIndex.value % betrayalLabels.length]
  currentLabel.value = label
  labelIndex.value += 1
}

function setForcedLabel(label: string): void {
  currentLabel.value = label
}

function motionPool(): Array<'move' | 'rotate' | 'jump' | 'shrink'> {
  return ['move', 'rotate', 'jump', 'shrink']
}

function applyMotion(effectCount: number): void {
  const pool = motionPool()
  let applied = 0

  while (pool.length > 0 && applied < effectCount) {
    const pickIndex = Math.floor(Math.random() * pool.length)
    const effect = pool.splice(pickIndex, 1)[0]
    if (!effect) {
      continue
    }

    if (effect === 'move') {
      moveX.value = Math.floor((Math.random() - 0.5) * prankTuning.betrayal.motion.movePx.x)
      moveY.value = Math.floor((Math.random() - 0.5) * prankTuning.betrayal.motion.movePx.y)
    }

    if (effect === 'rotate') {
      rotateDeg.value = Math.floor((Math.random() - 0.5) * prankTuning.betrayal.motion.rotateDeg)
    }

    if (effect === 'jump') {
      const jump =
        prankTuning.betrayal.motion.jumpPx.min +
        Math.floor(Math.random() * (prankTuning.betrayal.motion.jumpPx.max - prankTuning.betrayal.motion.jumpPx.min + 1))
      moveY.value = -Math.max(prankTuning.betrayal.motion.jumpPx.min, jump)
    }

    if (effect === 'shrink') {
      scale.value = prankTuning.betrayal.motion.scale.min + Math.random() * prankTuning.betrayal.motion.scale.range
    }

    applied += 1
  }

  resetMotion(prankTuning.betrayal.motion.resetDelayMs)
}

function shouldBetray(triggered: TriggeredPrank | null): boolean {
  if (isSettled.value) {
    return false
  }

  const baseChance = attempts.value <= 2 ? prankTuning.betrayal.chance.early : prankTuning.betrayal.chance.late
  const engineBoost = triggered ? prankTuning.betrayal.chance.engineBoost : 0
  return Math.random() < Math.min(prankTuning.betrayal.chance.cap, baseChance + engineBoost)
}

function maybeApplyLabelSwap(triggered: TriggeredPrank | null, force = false): void {
  if (isSettled.value) {
    currentLabel.value = props.label
    return
  }

  const chance = force
    ? prankTuning.betrayal.labelSwapChance.forced
    : triggered
      ? prankTuning.betrayal.labelSwapChance.withTrigger
      : prankTuning.betrayal.labelSwapChance.base
  if (Math.random() < chance) {
    setNextBetrayalLabel()
  }
}

function settleIfNeeded(): boolean {
  if (attempts.value < releaseAt.value) {
    return false
  }

  state.value = 'settled'
  currentLabel.value = props.label
  moveX.value = 0
  moveY.value = 0
  rotateDeg.value = 0
  scale.value = 1
  return true
}

function onHover(): void {
  if (props.disabled || isSettled.value) {
    return
  }

  hoverCount.value += 1
  const triggered = prankEngine.registerHover({ targetId: props.prankId })
  if (state.value === 'idle') {
    state.value = 'suspicious'
  }

  maybeApplyLabelSwap(triggered, false)
  const effectCount = triggered ? prankTuning.betrayal.motion.maxEffectsPerInteraction : 1
  if (hoverCount.value % 2 === 0) {
    applyMotion(effectCount)
  }
}

function onPress(event: Event, navigate?: () => void): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  attempts.value += 1
  emit('attempt')
  const triggered = prankEngine.registerClick({ targetId: props.prankId })
  const combo = props.comboScreen ? comboMode.maybeTriggerCombo(props.comboScreen, prankEngine.chaosLevel.value) : null

  if (settleIfNeeded()) {
    rearmCycle()
    if (navigate) {
      navigate()
      emit('action')
      return
    }
    emit('action')
    return
  }

  if (combo) {
    state.value = 'betrayal'
    setForcedLabel(combo.labelOverride)
    applyMotion(prankTuning.betrayal.motion.maxEffectsPerInteraction)
    emit('combo', combo)

    if (navigate) {
      navigate()
      emit('action')
      return
    }
    emit('action')
    return
  }

  const betrayalNow = shouldBetray(triggered)
  const effectCount = betrayalNow && triggered ? prankTuning.betrayal.motion.maxEffectsPerInteraction : 1
  applyMotion(effectCount)
  maybeApplyLabelSwap(triggered, betrayalNow)

  if (betrayalNow) {
    state.value = 'betrayal'
    event.preventDefault()
    event.stopPropagation()
    return
  }

  state.value = 'suspicious'
  if (navigate) {
    navigate()
    emit('action')
    return
  }
  emit('action')
}
</script>

<template>
  <RouterLink v-if="to" :to="to" custom v-slot="{ navigate, href }">
    <a
      v-bind="attrs"
      :href="href"
      :class="['betrayal-button', `state-${state}`]"
      :style="transformStyle"
      @mouseenter="onHover"
      @click="(event) => onPress(event, navigate)"
    >
      {{ currentLabel }}
    </a>
  </RouterLink>

  <button
    v-else
    v-bind="attrs"
    :type="type"
    :disabled="disabled"
    :class="['betrayal-button', `state-${state}`]"
    :style="transformStyle"
    @mouseenter="onHover"
    @click="onPress"
  >
    {{ currentLabel }}
  </button>
</template>

<style scoped>
.betrayal-button {
  transform-origin: center;
  transition: transform 180ms ease, filter 180ms ease;
  will-change: transform;
}

.state-idle {
  filter: saturate(1);
}

.state-suspicious {
  filter: saturate(1.08);
}

.state-betrayal {
  filter: saturate(1.18);
}

.state-settled {
  filter: saturate(1);
}
</style>
