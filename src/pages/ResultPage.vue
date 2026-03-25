<script setup lang="ts">
import { ref } from 'vue'
import type { MatchOutput } from '../engine/matcher'

const RESULT_STORAGE_KEY = 'cringe-detector-result'

const result = ref<MatchOutput | null>(null)
const imageFailed = ref(false)

function isValidResult(payload: unknown): payload is MatchOutput {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const maybeResult = payload as MatchOutput
  return (
    typeof maybeResult.percentage === 'number' &&
    !!maybeResult.meme &&
    typeof maybeResult.meme.title === 'string' &&
    typeof maybeResult.meme.imageUrl === 'string' &&
    typeof maybeResult.meme.roast === 'string'
  )
}

try {
  const savedResult = sessionStorage.getItem(RESULT_STORAGE_KEY)
  if (savedResult) {
    const parsed = JSON.parse(savedResult)
    result.value = isValidResult(parsed) ? parsed : null
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
  padding: 18px;
  background: linear-gradient(170deg, #fff6f1 0%, #ffffff 100%);
  border: 1px solid #ffd8c5;
  display: grid;
  gap: 10px;
}

.meme-image {
  width: 100%;
  height: 170px;
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
  font-size: 1.5rem;
  line-height: 1.2;
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
}
</style>
