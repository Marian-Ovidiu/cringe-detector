<script setup lang="ts">
import type { FloatingMemeItem } from '../../composables/useFloatingMemeAttack'

defineProps<{
  items: FloatingMemeItem[]
}>()
</script>

<template>
  <div class="floating-meme-overlay" aria-hidden="true">
    <div
      v-for="item in items"
      :key="item.id"
      class="floating-item"
      :class="`kind-${item.kind}`"
      :style="{
        left: `${item.xPercent}%`,
        top: `${item.yPercent}%`,
        '--drift-x': `${item.driftX}px`,
        '--drift-y': `${item.driftY}px`,
        '--float-duration': `${item.durationMs}ms`,
        '--float-scale': String(item.sizeScale),
      }"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<style scoped>
.floating-meme-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 4;
}

.floating-item {
  position: absolute;
  transform: translate3d(0, 0, 0);
  animation: float-fade var(--float-duration) ease-out forwards;
  white-space: nowrap;
}

.kind-emoji {
  font-size: 1.2rem;
}

.kind-label,
.kind-badge {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: 999px;
  padding: 4px 8px;
}

.kind-label {
  background: rgba(255, 214, 195, 0.88);
  color: #742f09;
}

.kind-badge {
  background: rgba(26, 39, 66, 0.88);
  color: #f4f7ff;
}

@keyframes float-fade {
  0% {
    opacity: 0;
    transform: translate3d(0, 8px, 0) scale(var(--float-scale));
  }

  12% {
    opacity: 0.94;
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--drift-x), var(--drift-y), 0) scale(calc(var(--float-scale) * 0.98));
  }
}
</style>
