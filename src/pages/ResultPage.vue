<template>
  <main class="screen">
    <p class="result-label">Your certified cringe form</p>

    <section class="result-card">
      <h1>LinkedIn Main Character</h1>
      <p class="score">87% match</p>
      <p class="summary">You turn every post into a personal TED Talk. Respectfully: stop.</p>
    </section>

    <RouterLink class="primary-button" to="/quiz">Scan again</RouterLink>
    <RouterLink class="secondary-link" to="/">Home</RouterLink>
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
  gap: 8px;
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
