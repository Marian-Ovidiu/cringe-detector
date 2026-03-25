<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MatchOutput } from '../engine/matcher'
import { matchBestMeme } from '../engine/matcher'
import { useQuizSession } from '../composables/useQuizSession'
import { questions } from '../data/questions'
import { memes } from '../data/memes'
import type { CompareResult } from '../types/quiz'
import { uiCopy } from '../data/copy'
import { fetchImgflipTemplates } from '../services/imgflip'

const result = ref<MatchOutput | null>(null)
const imageFailed = ref(false)
const shareFeedback = ref('')
const friendResult = ref<CompareResult | null>(null)
const imgflipTemplateUrls = ref<Record<string, string>>({})
const quizSession = useQuizSession()
const route = useRoute()
const router = useRouter()

function normalizeMemeId(value: string): string {
  return value.trim().toLowerCase().replaceAll('_', '-')
}

function parseQueryResult(): MatchOutput | null {
  const memeQuery = typeof route.query.meme === 'string' ? route.query.meme : ''
  const scoreQuery = typeof route.query.score === 'string' ? route.query.score : ''
  const score = Number(scoreQuery)

  if (!memeQuery || !Number.isFinite(score)) {
    return null
  }

  const normalizedId = normalizeMemeId(memeQuery)
  const meme = memes.find((item) => normalizeMemeId(item.id) === normalizedId)
  if (!meme) {
    return null
  }

  return {
    meme,
    percentage: Math.max(0, Math.min(100, Math.round(score))),
  }
}

function buildShareUrl(memeId: string, percentage: number): string {
  const params = new URLSearchParams({
    ref: `${memeId}:${percentage}`,
  })
  return `${window.location.origin}/quiz?${params.toString()}`
}

const shareUrl = computed(() => {
  if (!result.value) {
    return window.location.href
  }

  return buildShareUrl(result.value.meme.id, result.value.percentage)
})

const shareText = computed(() => {
  if (!result.value) {
    return ''
  }

  return `Ho fatto ${result.value.percentage}% cringe \uD83D\uDC80
Sono: ${result.value.meme.title}

Provalo: ${shareUrl.value}`
})

const displayImageUrl = computed(() => {
  if (!result.value) {
    return ''
  }

  const templateId = result.value.meme.imgflipTemplateId
  if (templateId && imgflipTemplateUrls.value[templateId]) {
    return imgflipTemplateUrls.value[templateId]
  }

  return result.value.meme.imageUrl
})

const rarityLabel = computed(() => {
  if (!result.value) {
    return ''
  }

  if (result.value.meme.rarity === 'legendary') {
    return uiCopy.result.rarity.legendary
  }

  if (result.value.meme.rarity === 'rare') {
    return uiCopy.result.rarity.rare
  }

  return uiCopy.result.rarity.common
})

const compareFeedback = computed(() => {
  if (!result.value || !friendResult.value) {
    return ''
  }

  const diff = result.value.percentage - friendResult.value.percentage
  if (Math.abs(diff) <= 4) {
    return uiCopy.result.compare.draw
  }

  if (Math.abs(diff) <= 11) {
    return uiCopy.result.compare.commentClose
  }

  if (diff >= 12) {
    return `${uiCopy.result.compare.win} - ${uiCopy.result.compare.commentBetter}`
  }

  return `${uiCopy.result.compare.lose} - ${uiCopy.result.compare.commentWorse}`
})

function setShareFeedback(value: string): void {
  shareFeedback.value = value
  window.setTimeout(() => {
    shareFeedback.value = ''
  }, 1800)
}

async function loadImgflipTemplateUrls(): Promise<void> {
  const templates = await fetchImgflipTemplates()
  if (templates.length === 0) {
    return
  }

  const templatesById = Object.fromEntries(templates.map((template) => [template.id, template.url]))
  const resolvedUrls: Record<string, string> = {}

  for (const meme of memes) {
    const templateId = meme.imgflipTemplateId
    if (!templateId) {
      continue
    }

    const templateUrl = templatesById[templateId]
    if (templateUrl) {
      resolvedUrls[templateId] = templateUrl
    }
  }

  imgflipTemplateUrls.value = resolvedUrls
}

async function onShare(): Promise<void> {
  if (!result.value) {
    return
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Cringe Detector',
        text: shareText.value,
        url: shareUrl.value,
      })
      setShareFeedback(uiCopy.result.toastSuccess)
      return
    }

    await navigator.clipboard.writeText(shareText.value)
    setShareFeedback(uiCopy.result.shareFallback)
  } catch (error) {
    const maybeError = error as Error
    if (maybeError.name === 'AbortError') {
      return
    }
    setShareFeedback(uiCopy.result.errorGeneric)
  }
}

try {
  const queryResult = parseQueryResult()
  if (queryResult) {
    result.value = queryResult
    quizSession.saveResult(queryResult)
    quizSession.clearFriendResult()
  } else {
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
  }

  if (result.value) {
    friendResult.value = quizSession.loadFriendResult()

    router.replace({
      path: '/result',
      query: {
        meme: result.value.meme.id,
        score: String(result.value.percentage),
      },
    })
    quizSession.clearAnswers()
  }
} catch {
  result.value = null
}

watch(displayImageUrl, () => {
  imageFailed.value = false
})

void loadImgflipTemplateUrls()
</script>

<template>
  <main class="screen">
    <p class="result-label">{{ uiCopy.result.title }}</p>
    <p class="result-subtitle">{{ uiCopy.result.subtitle }}</p>

    <section v-if="result" class="result-card">
      <img
        v-if="!imageFailed"
        :src="displayImageUrl"
        :alt="result.meme.title"
        class="meme-image"
        @error="imageFailed = true"
      />
      <div v-else class="meme-image fallback">{{ uiCopy.result.noImage }}</div>

      <p class="you-are">{{ uiCopy.result.youAre }}</p>
      <h1>{{ result.meme.title }}</h1>
      <p class="score">{{ result.percentage }}% {{ uiCopy.result.scoreSuffix }}</p>
      <p class="level-label">
        {{ uiCopy.result.levelLabel }}
        <span class="rarity" :class="`rarity-${result.meme.rarity}`">{{ rarityLabel }}</span>
      </p>
      <p class="summary">{{ result.meme.roast }}</p>

      <section v-if="friendResult" class="compare-box">
        <p class="compare-title">{{ uiCopy.result.compare.title }}</p>
        <p class="compare-line">{{ uiCopy.result.compare.you(result.percentage) }}</p>
        <p class="compare-line">{{ uiCopy.result.compare.friend(friendResult.percentage) }}</p>
        <p class="compare-feedback">{{ compareFeedback }}</p>
      </section>
    </section>

    <section v-else class="result-card">
      <h1>{{ uiCopy.result.emptyTitle }}</h1>
      <p class="summary">{{ uiCopy.result.emptyDescription }}</p>
    </section>

    <div class="actions">
      <button type="button" class="primary-button share-button" :disabled="!result" @click="onShare">
        {{ uiCopy.result.share }}
      </button>
      <RouterLink class="secondary-link retry-link" to="/quiz">{{ uiCopy.result.retry }}</RouterLink>
    </div>

    <p v-if="shareFeedback" class="feedback">{{ shareFeedback }}</p>
    <RouterLink class="secondary-link" to="/">{{ uiCopy.result.home }}</RouterLink>
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

.result-subtitle {
  margin: -8px 0 0;
  color: #5a6783;
  font-size: 0.95rem;
  font-weight: 600;
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

.you-are {
  margin: 0;
  font-size: 0.9rem;
  color: #5a6783;
  font-weight: 700;
}

.level-label {
  margin: 0;
  font-size: 0.93rem;
  color: #5a6783;
  font-weight: 700;
}

.rarity {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.rarity-common {
  color: #4b5a76;
}

.rarity-rare {
  color: #4d3bb6;
}

.rarity-legendary {
  color: #c14d05;
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

.compare-box {
  border-radius: 12px;
  border: 1px solid #ffd8c5;
  background: #fff9f6;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}

.compare-line {
  margin: 0;
  font-size: 0.92rem;
  color: #394867;
  font-weight: 700;
}

.compare-title {
  margin: 0 0 2px;
  font-size: 0.86rem;
  color: #8a3406;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 800;
}

.compare-feedback {
  margin: 2px 0 0;
  font-size: 0.9rem;
  color: #8a3406;
  font-weight: 700;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.share-button {
  margin-top: 0;
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

.retry-link {
  min-height: 56px;
  font-weight: 700;
  color: #233350;
}

.feedback {
  margin: 0;
  text-align: center;
  font-size: 0.88rem;
  color: #8e3809;
  font-weight: 700;
}
</style>
