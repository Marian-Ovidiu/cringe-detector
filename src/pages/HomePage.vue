<template>
  <main class="screen home-page">
    <p class="eyebrow">Roast speedrun</p>
    <h1>Cringe Detector</h1>
    <p class="subtitle">15 seconds and we expose your online aura.</p>
    <RouterLink class="cta-button" to="/quiz">Scan me</RouterLink>
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
</style>
