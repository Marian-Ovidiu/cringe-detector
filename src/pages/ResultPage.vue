<script setup lang="ts">
import { ref } from 'vue'
import type { MatchOutput } from '../engine/matcher'
import { matchBestMeme } from '../engine/matcher'
import { useQuizSession } from '../composables/useQuizSession'
import { questions } from '../data/questions'

const result = ref<MatchOutput | null>(null)
const imageFailed = ref(false)
const quizSession = useQuizSession()

try {
  const savedResult = quizSession.loadResult()
  if (savedResult) {
    result.value = savedResult
  } else {
    const savedAnswers = quizSession.loadAnswers()
    if (savedAnswers.length === questions.length) {
      const recovered = matchBestMeme(savedAnswers)
      quizSession.saveResult(recovered)
      result.value = recovered
    }
  }
} catch {
  result.value = null
}
</script>

<template>
  <main class="screen">
    <p class="result-label">Your certified cringe form</p>

    <section v-if="result" class="result-card">
      <img
        v-if="!imageFailed"
        :src="result.meme.imageUrl"
        :alt="result.meme.title"
        class="meme-image"
        @error="imageFailed = true"
      />
      <div v-else class="meme-image fallback">Meme loading like your self-awareness.</div>

      <h1>{{ result.meme.title }}</h1>
      <p class="score">{{ result.percentage }}% cringe match</p>
      <p class="summary">{{ result.meme.roast }}</p>
    </section>

    <section v-else class="result-card">
      <h1>No roast yet.</h1>
      <p class="summary">You opened results without taking the quiz. Bold and suspicious.</p>
    </section>

    <RouterLink class="primary-button" to="/quiz">Retry</RouterLink>
    <RouterLink class="secondary-link" to="/">Go home</RouterLink>
  </main>
</template>

<style scoped>
.result-label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7d2f05;
}

.result-card {
  border-radius: 16px;
  padding: 18px 16px;
  background: linear-gradient(170deg, #fff6f1 0%, #ffffff 100%);
  border: 1px solid #ffd8c5;
  display: grid;
  gap: 12px;
}

.meme-image {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  background: #f6d8c8;
}

.fallback {
  display: grid;
  place-items: center;
  padding: 12px;
  font-size: 0.9rem;
  color: #5f4f47;
}

h1 {
  margin: 0;
  font-size: 1.58rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.score {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #b43a06;
}

.summary {
  margin: 0;
  color: #4d5a76;
}

.secondary-link {
  text-align: center;
  text-decoration: none;
  color: #32415f;
  font-weight: 600;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid #d7dfef;
  background: #f7f9fd;
}
</style>
