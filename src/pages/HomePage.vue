<script setup lang="ts">
import { uiCopy } from '../data/copy'
</script>

<template>
  <main class="screen home-page">
    <p class="eyebrow">{{ uiCopy.home.eyebrow }}</p>
    <h1>{{ uiCopy.home.title }}</h1>
    <p class="subtitle">{{ uiCopy.home.subtitle }}</p>
    <p class="secondary">{{ uiCopy.home.secondary }}</p>
    <RouterLink class="cta-button" to="/quiz">{{ uiCopy.home.cta }}</RouterLink>
    <p class="footer">{{ uiCopy.home.footer }}</p>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

h1 {
  margin: 0;
  font-size: 2.4rem;
  line-height: 1.05;
  letter-spacing: -0.03em;
  max-width: 12ch;
}

.eyebrow {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #7b3b03;
}

.subtitle {
  margin: 0;
  color: #495674;
  font-size: 1.02rem;
  max-width: 27ch;
}

.secondary {
  margin: 0;
  color: #6a7590;
  font-size: 0.93rem;
}

.cta-button {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  width: 100%;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.05rem;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6d2f, #ff3c7f);
  box-shadow: 0 10px 20px rgba(255, 60, 127, 0.25);
}

.cta-button:active {
  transform: translateY(1px);
}

.cta-button:focus-visible {
  outline: 2px solid #111d38;
  outline-offset: 2px;
}

.footer {
  margin: 6px 0 0;
  color: #8b93a8;
  font-size: 0.8rem;
}
</style>
