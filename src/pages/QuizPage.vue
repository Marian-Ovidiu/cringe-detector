<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questions } from '../data/questions'
import { matchBestMeme } from '../engine/matcher'
import type { Answer } from '../types/quiz'
import type { CompareResult } from '../types/quiz'
import type { TriggeredPrank } from '../types/prank'
import type { ComboDecision } from '../composables/useComboMode'
import { useQuizSession } from '../composables/useQuizSession'
import { usePrankEngine } from '../composables/usePrankEngine'
import { useFloatingMemeAttack } from '../composables/useFloatingMemeAttack'
import { useRoastInterrupt } from '../composables/useRoastInterrupt'
import { useMemoryMock } from '../composables/useMemoryMock'
import { uiCopy } from '../data/copy'
import { prankTuning } from '../data/prankTuning'
import FloatingMemeOverlay from '../components/pranks/FloatingMemeOverlay.vue'
import RoastInterruptLayer from '../components/pranks/RoastInterruptLayer.vue'
import BetrayalButton from '../components/pranks/BetrayalButton.vue'

const router = useRouter()
const route = useRoute()
const quizSession = useQuizSession()
const prankEngine = usePrankEngine()
const floatingAttack = useFloatingMemeAttack({ maxActive: prankTuning.floating.maxActiveByScreen.quiz })
const roastInterrupt = useRoastInterrupt({ maxActive: prankTuning.roast.maxActive })
const memoryMock = useMemoryMock()
const totalQuestions = questions.length

const restoredAnswers = quizSession.loadAnswers()
const safeAnswers = restoredAnswers.length >= totalQuestions ? [] : restoredAnswers
const friendResult = ref<CompareResult | null>(quizSession.loadFriendResult())
const fakeProgressLabels = ['quasi', 'aspetta', 'forse', 'non era vero', 'vabbe']
const fakeButtonLabels = ['Send foto piedi', 'fix me', 'skip', 'non cliccare', 'gratis?']
const fakeFinishLines = ['non cliccare', 'gratis?', 'Send foto piedi', 'skip', 'fix me']

const currentIndex = ref(safeAnswers.length)
const selectedAnswers = ref<Answer[]>(safeAnswers)
const isDone = ref(false)
const fakeActionFeedback = ref('')
const fakeButtonLabel = ref('skip')
const displayedProgress = ref(0)
const fakeProgressStatus = ref('')
const isProgressGlitching = ref(false)
let fakeStepOneTimer: ReturnType<typeof window.setTimeout> | null = null
let fakeStepTwoTimer: ReturnType<typeof window.setTimeout> | null = null
let fakeStepThreeTimer: ReturnType<typeof window.setTimeout> | null = null
const lastAnswerAt = ref(Date.now())

const currentQuestion = computed(() => questions[currentIndex.value] ?? null)
const realProgressStep = computed(() => Math.min(currentIndex.value + 1, totalQuestions))
const realProgressPercent = computed(() => {
  if (totalQuestions === 0) {
    return 0
  }

  return (realProgressStep.value / totalQuestions) * 100
})
const progressText = computed(() => uiCopy.quiz.progress(realProgressStep.value, totalQuestions))
const memoryLine = computed(() => memoryMock.getContextLine('quiz'))
const progressWidth = computed(() => {
  return `${displayedProgress.value}%`
})

function parseFriendRef(rawRef: unknown): CompareResult | null {
  if (typeof rawRef !== 'string') {
    return null
  }

  const [meme, score] = rawRef.split(':')
  if (!meme || !score) {
    return null
  }

  const percentage = Number(score)
  if (!Number.isFinite(percentage)) {
    return null
  }

  return {
    meme: meme.trim(),
    percentage: Math.max(0, Math.min(100, Math.round(percentage))),
  }
}

const sharedRef = parseFriendRef(route.query.ref)
if (sharedRef) {
  friendResult.value = sharedRef
  quizSession.saveFriendResult(sharedRef)
}

displayedProgress.value = realProgressPercent.value

function clearFakeProgressTimers(): void {
  if (fakeStepOneTimer) {
    window.clearTimeout(fakeStepOneTimer)
    fakeStepOneTimer = null
  }

  if (fakeStepTwoTimer) {
    window.clearTimeout(fakeStepTwoTimer)
    fakeStepTwoTimer = null
  }

  if (fakeStepThreeTimer) {
    window.clearTimeout(fakeStepThreeTimer)
    fakeStepThreeTimer = null
  }
}

function maybeTriggerFakeProgress(triggered: TriggeredPrank | null): void {
  const shouldPrank =
    Math.random() <
    (triggered ? prankTuning.fakeProgress.triggerChance.withPrankTrigger : prankTuning.fakeProgress.triggerChance.base)
  if (!shouldPrank || totalQuestions < prankTuning.fakeProgress.minQuestions) {
    displayedProgress.value = realProgressPercent.value
    fakeProgressStatus.value = ''
    isProgressGlitching.value = false
    return
  }

  clearFakeProgressTimers()
  isProgressGlitching.value = true
  fakeProgressStatus.value = fakeProgressLabels[Math.floor(Math.random() * fakeProgressLabels.length)] ?? 'forse'

  const target = realProgressPercent.value
  const backwardJump = Math.min(
    target * prankTuning.fakeProgress.intensity.backwardScale,
    prankTuning.fakeProgress.intensity.backwardMin + Math.random() * prankTuning.fakeProgress.intensity.backwardRandom,
  )
  const fakeForward = Math.min(
    100,
    target + prankTuning.fakeProgress.intensity.forwardMin + Math.random() * prankTuning.fakeProgress.intensity.forwardRandom,
  )

  displayedProgress.value = Math.max(0, target - backwardJump)

  fakeStepOneTimer = window.setTimeout(() => {
    displayedProgress.value = fakeForward
  }, prankTuning.fakeProgress.timingMs.stepOne)

  fakeStepTwoTimer = window.setTimeout(() => {
    displayedProgress.value = target
    fakeProgressStatus.value = ''
    isProgressGlitching.value = false
  }, prankTuning.fakeProgress.timingMs.recover)
}

function onFakeFinishNow(): void {
  if (!currentQuestion.value || isDone.value) {
    return
  }

  const triggered = prankEngine.registerClick({ targetId: 'fake-finish-now' })
  memoryMock.trackFakeButtonClick()
  roastInterrupt.registerInteraction()
  roastInterrupt.handlePrankTrigger(triggered)
  floatingAttack.registerActivity('spam_click')
  floatingAttack.handlePrankTrigger(triggered)
  floatingAttack.spawn('label')
  if (Math.random() < 0.45) {
    floatingAttack.spawn('emoji')
  }

  fakeActionFeedback.value = fakeFinishLines[Math.floor(Math.random() * fakeFinishLines.length)] ?? 'non era vero'
  fakeButtonLabel.value = fakeButtonLabels[Math.floor(Math.random() * fakeButtonLabels.length)] ?? 'skip'
  window.setTimeout(() => {
    fakeActionFeedback.value = ''
  }, 1200)
  maybeTriggerFakeProgress(triggered)
}

function onFakeFinishAttempt(): void {
  memoryMock.trackCtaClick('fake-finish-now')
  memoryMock.trackSpamClick('fake-finish-now')
}

function onFakeFinishCombo(combo: ComboDecision): void {
  for (let i = 0; i < combo.floatingBursts; i += 1) {
    floatingAttack.spawn(i % 2 === 0 ? 'emoji' : 'label')
  }
  for (let i = 0; i < combo.roastBursts; i += 1) {
    roastInterrupt.triggerComboInterrupt()
  }
  fakeActionFeedback.value = combo.labelOverride
  window.setTimeout(() => {
    fakeActionFeedback.value = ''
  }, 1100)
}

function onAnswerTap(answer: Answer): void {
  if (!currentQuestion.value || isDone.value) {
    return
  }

  const now = Date.now()
  memoryMock.trackAnswerTiming(now - lastAnswerAt.value)
  memoryMock.trackSpamClick(`answer-${answer.id}`)
  roastInterrupt.registerInteraction()
  roastInterrupt.registerFastAnswer(now - lastAnswerAt.value)
  lastAnswerAt.value = now

  const triggered = prankEngine.registerAnswer({
    targetId: `answer-${answer.id}`,
    answerId: answer.id,
    questionId: currentQuestion.value.id,
  })
  floatingAttack.registerActivity('answer')
  floatingAttack.handlePrankTrigger(triggered)

  selectedAnswers.value.push(answer)
  quizSession.saveAnswers(selectedAnswers.value)
  quizSession.clearResult()

  if (currentIndex.value < totalQuestions - 1) {
    currentIndex.value += 1
    roastInterrupt.registerQuestionChange()
    roastInterrupt.handlePrankTrigger(triggered)
    maybeTriggerFakeProgress(triggered)
    return
  }

  isDone.value = true
  floatingAttack.registerActivity('progress')
  const result = matchBestMeme(selectedAnswers.value)
  quizSession.saveResult(result)
  router.push('/result')
}

watch(
  realProgressPercent,
  (next) => {
    if (!isProgressGlitching.value) {
      displayedProgress.value = next
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearFakeProgressTimers()
})

watch(
  () => prankEngine.triggerHistory.value[0]?.triggeredAt ?? 0,
  (latestStamp) => {
    if (!latestStamp) {
      return
    }

    floatingAttack.registerActivity('prank_trigger')
  },
)
</script>

<template>
  <main class="screen prank-host">
    <header class="top-row">
      <RouterLink class="text-link" to="/">{{ uiCopy.quiz.back }}</RouterLink>
      <span class="chip">{{ progressText }}</span>
    </header>

    <div class="progress-track" role="progressbar" :aria-valuenow="realProgressStep" :aria-valuemin="1" :aria-valuemax="totalQuestions">
      <div class="progress-fill" :class="{ glitching: isProgressGlitching }" :style="{ width: progressWidth }"></div>
    </div>
    <p v-if="fakeProgressStatus" class="progress-prank-label">{{ fakeProgressStatus }}</p>

    <section v-if="friendResult" class="friend-banner">
      {{ uiCopy.quiz.friendBanner(friendResult.percentage) }}
    </section>
    <p v-if="memoryLine" class="memory-mock">{{ memoryLine }}</p>

    <section v-if="currentQuestion" class="card">
      <h1>{{ currentQuestion.prompt }}</h1>
      <p>{{ uiCopy.quiz.helper }}</p>
    </section>

    <section v-if="currentQuestion" class="answers">
      <button
        v-for="answer in currentQuestion.answers"
        :key="answer.id"
        type="button"
        class="answer"
        @mouseenter="roastInterrupt.registerHover"
        @click="onAnswerTap(answer)"
      >
        {{ answer.text }}
      </button>
    </section>

    <BetrayalButton
      v-if="currentQuestion"
      class="fake-action-button"
      prank-id="fake-finish-now"
      combo-screen="quiz"
      :label="fakeButtonLabel"
      @attempt="onFakeFinishAttempt"
      @combo="onFakeFinishCombo"
      @action="onFakeFinishNow"
    />
    <p v-if="fakeActionFeedback" class="fake-action-feedback">{{ fakeActionFeedback }}</p>

    <section v-else class="card">
      <h1>{{ uiCopy.quiz.emptyTitle }}</h1>
      <p>{{ uiCopy.quiz.emptyDescription }}</p>
      <RouterLink class="primary-button" to="/">{{ uiCopy.quiz.emptyCta }}</RouterLink>
    </section>

    <FloatingMemeOverlay :items="floatingAttack.items.value" />
    <RoastInterruptLayer :items="roastInterrupt.interrupts.value" />
  </main>
</template>

<style scoped>
.prank-host {
  position: relative;
  overflow: hidden;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-link {
  color: #32415f;
  text-decoration: none;
  font-weight: 600;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
}

.chip {
  border-radius: 999px;
  background: #e9eef9;
  color: #3f4d69;
  padding: 7px 11px;
  font-size: 0.8rem;
  font-weight: 700;
}

.progress-track {
  height: 8px;
  border-radius: 999px;
  background: #e8edf8;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff6d2f, #ff3c7f);
  transition: width 0.2s ease;
}

.progress-fill.glitching {
  animation: progress-glitch 0.22s linear 2;
}

.progress-prank-label {
  margin: -10px 0 -2px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #7e3308;
  letter-spacing: 0.01em;
}

.card {
  display: grid;
  gap: 8px;
  margin-top: 2px;
}

.friend-banner {
  border-radius: 12px;
  border: 1px solid #d7dfef;
  background: #f7f9fe;
  color: #394867;
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

h1 {
  margin: 0;
  font-size: 1.48rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

p {
  margin: 0;
  color: #53617e;
}

.answers {
  display: grid;
  gap: 12px;
}

.answer {
  width: 100%;
  min-height: 56px;
  border: 1px solid #d7dfef;
  border-radius: 12px;
  background: #fff;
  color: #1f2b44;
  font-size: 0.98rem;
  font-weight: 600;
  text-align: left;
  padding: 0 14px;
}

.answer:active {
  background: #f3f6fc;
}

.answer:focus-visible {
  outline: 2px solid #ff6d2f;
  outline-offset: 2px;
}

.fake-action-button {
  align-self: center;
  min-height: 36px;
  border: 1px dashed #d6deef;
  border-radius: 999px;
  background: #f8fafe;
  color: #506181;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0 12px;
}

.fake-action-feedback {
  margin: -10px 0 0;
  text-align: center;
  font-size: 0.8rem;
  color: #8c3909;
  font-weight: 700;
}

.memory-mock {
  margin: -10px 0 -2px;
  font-size: 0.82rem;
  color: #8c3909;
  font-weight: 700;
}

@keyframes progress-glitch {
  0% {
    filter: saturate(1) contrast(1);
  }

  33% {
    filter: saturate(1.4) contrast(1.15);
  }

  100% {
    filter: saturate(1) contrast(1);
  }
}
</style>
