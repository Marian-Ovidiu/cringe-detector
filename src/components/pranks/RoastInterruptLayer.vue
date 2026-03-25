<script setup lang="ts">
import type { RoastInterruptItem } from '../../composables/useRoastInterrupt'

defineProps<{
  items: RoastInterruptItem[]
}>()
</script>

<template>
  <div class="roast-layer" aria-hidden="true">
    <div
      v-for="item in items"
      :key="item.id"
      class="roast-item"
      :class="`style-${item.style}`"
      :style="{ '--roast-duration': `${item.durationMs}ms` }"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<style scoped>
.roast-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
}

.roast-item {
  position: absolute;
  animation: roast-pop var(--roast-duration) ease forwards;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.style-toast {
  left: 50%;
  bottom: 10%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(20, 29, 49, 0.9);
  color: #f5f8ff;
  font-size: 0.8rem;
  padding: 7px 11px;
}

.style-banner {
  top: 12%;
  left: 8%;
  right: 8%;
  border-radius: 10px;
  background: rgba(255, 223, 208, 0.92);
  color: #7a3006;
  font-size: 0.82rem;
  padding: 8px 10px;
  text-align: center;
}

.style-bubble {
  top: 18%;
  right: 10%;
  border-radius: 12px;
  background: rgba(245, 249, 255, 0.95);
  border: 1px solid rgba(197, 208, 228, 0.95);
  color: #304666;
  font-size: 0.78rem;
  padding: 7px 9px;
}

@keyframes roast-pop {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }

  15% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateY(-8px) scale(1);
  }
}
</style>
