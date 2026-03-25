<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questions } from '../data/questions'
import { matchBestMeme } from '../engine/matcher'
import type { Answer } from '../types/quiz'
import type { CompareResult } from '../types/quiz'
import { useQuizSession } from '../composables/useQuizSession'

const router = useRouter()
const route = useRoute()
const quizSession = useQuizSession()
const totalQuestions = questions.length

const restoredAnswers = quizSession.loadAnswers()
const safeAnswers = restoredAnswers.length >= totalQuestions ? [] : restoredAnswers
const friendResult = ref<CompareResult | null>(quizSession.loadFriendResult())

const currentIndex = ref(safeAnswers.length)
const selectedAnswers = ref<Answer[]>(safeAnswers)
const isDone = ref(false)

const currentQuestion = computed(() => questions[currentIndex.value] ?? null)
const progressText = computed(() => `${Math.min(currentIndex.value + 1, totalQuestions)}/${totalQuestions}`)
const progressWidth = computed(() => {
  if (totalQuestions === 0) {
    return '0%'
  }

  return `${(Math.min(currentIndex.value + 1, totalQuestions) / totalQuestions) * 100}%`
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

function onAnswerTap(answer: Answer): void {
  if (!currentQuestion.value || isDone.value) {
    return
  }

  selectedAnswers.value.push(answer)
  quizSession.saveAnswers(selectedAnswers.value)
  quizSession.clearResult()

  if (currentIndex.value < totalQuestions - 1) {
    currentIndex.value += 1
    return
  }

  isDone.value = true
  const result = matchBestMeme(selectedAnswers.value)
  quizSession.saveResult(result)
  router.push('/result')
}
</script>

<template>
  <main class="screen">
    <header class="top-row">
      <RouterLink class="text-link" to="/">Back</RouterLink>
      <span class="chip">{{ progressText }}</span>
    </header>

    <div class="progress-track" role="progressbar" :aria-valuenow="currentIndex + 1" :aria-valuemin="1" :aria-valuemax="totalQuestions">
      <div class="progress-fill" :style="{ width: progressWidth }"></div>
    </div>

    <section v-if="friendResult" class="friend-banner">
      Your friend got {{ friendResult.percentage }}% cringe. Beat that.
    </section>

    <section v-if="currentQuestion" class="card">
      <h1>{{ currentQuestion.prompt }}</h1>
      <p>Pick fast. Your taste gets judged anyway.</p>
    </section>

    <section v-if="currentQuestion" class="answers">
      <button
        v-for="answer in currentQuestion.answers"
        :key="answer.id"
        type="button"
        class="answer"
        @click="onAnswerTap(answer)"
      >
        {{ answer.text }}
      </button>
    </section>

    <section v-else class="card">
      <h1>No questions found.</h1>
      <p>Even your quiz disappeared. Go home and restart.</p>
      <RouterLink class="primary-button" to="/">Go home</RouterLink>
    </section>
  </main>
</template>

<style scoped>
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
</style>
