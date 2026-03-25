<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { questions } from '../data/questions'
import { matchBestMeme } from '../engine/matcher'
import type { Answer } from '../types/quiz'

const RESULT_STORAGE_KEY = 'cringe-detector-result'

const router = useRouter()
const currentIndex = ref(0)
const selectedAnswers = ref<Answer[]>([])
const isDone = ref(false)

sessionStorage.removeItem(RESULT_STORAGE_KEY)

const totalQuestions = questions.length
const currentQuestion = computed(() => questions[currentIndex.value] ?? null)
const progressText = computed(() => `${Math.min(currentIndex.value + 1, totalQuestions)}/${totalQuestions}`)
const progressWidth = computed(() => `${(Math.min(currentIndex.value + 1, totalQuestions) / totalQuestions) * 100}%`)

function onAnswerTap(answer: Answer): void {
  if (!currentQuestion.value || isDone.value) {
    return
  }

  selectedAnswers.value.push(answer)

  if (currentIndex.value < totalQuestions - 1) {
    currentIndex.value += 1
    return
  }

  isDone.value = true
  const result = matchBestMeme(selectedAnswers.value)
  sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result))
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
}

.chip {
  border-radius: 999px;
  background: #e9eef9;
  color: #3f4d69;
  padding: 6px 10px;
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
  gap: 6px;
}

h1 {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.2;
}

p {
  margin: 0;
  color: #53617e;
}

.answers {
  display: grid;
  gap: 10px;
}

.answer {
  width: 100%;
  min-height: 52px;
  border: 1px solid #d7dfef;
  border-radius: 12px;
  background: #fff;
  color: #1f2b44;
  font-size: 0.98rem;
  font-weight: 600;
}

.answer:active {
  background: #f3f6fc;
}
</style>
