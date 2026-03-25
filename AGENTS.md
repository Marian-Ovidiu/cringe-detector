# Cringe Detector - Agent Guidance

Small, playful meme game. Optimize for speed, clarity, and fun.

## Product Rules
- Mobile-first always (design, spacing, interactions).
- Fast interactions over complex visuals.
- No overengineering: simple components, clear state, minimal abstractions.
- MVP has no backend. Use local data only (`src/data`).

## Build Rules
- Prefer Vue 3 Composition API + TypeScript.
- Keep files small and easy to scan.
- Ship vertical slices fast, then polish.
- Add only dependencies that remove clear pain.

## UX Rules
- One clear primary action per screen.
- Keep tap targets thumb-friendly.
- Make feedback instant (state, score, next step).
- Tone should feel playful, meme-native, never corporate.

## Done Criteria
- Works on small screens first.
- No obvious interaction lag.
- No dead-end navigation.
- `npm run build` passes.
