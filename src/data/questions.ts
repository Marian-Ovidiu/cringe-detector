import type { Question } from '../types/quiz'

export const questions: Question[] = [
  {
    id: 'q1',
    prompt: 'Morning alarm. You:',
    answers: [
      { id: 'q1a1', text: 'Snooze 4 times', tagWeights: { lazy: 1, doomscroll: 0.6, cringe: 0.4 } },
      { id: 'q1a2', text: 'Cold shower speech', tagWeights: { alpha: 1, performative: 0.7, cringe: 0.5 } },
      { id: 'q1a3', text: 'Post a quote first', tagWeights: { corporate: 0.8, performative: 1, cringe: 0.8 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'In group chat you are:',
    answers: [
      { id: 'q2a1', text: 'Silent lurker', tagWeights: { soft: 0.6, dry: 0.5, lazy: 0.4 } },
      { id: 'q2a2', text: 'Capslock striker', tagWeights: { loud: 1, chaos: 0.6, cringe: 0.7 } },
      { id: 'q2a3', text: 'Debate starter', tagWeights: { hottake: 1, troll: 0.7, cringe: 0.5 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'Your selfie caption:',
    answers: [
      { id: 'q3a1', text: '"No filter" (3 filters)', tagWeights: { delulu: 0.9, performative: 0.6, cringe: 0.8 } },
      { id: 'q3a2', text: '"Built different"', tagWeights: { alpha: 0.9, dramatic: 0.4, cringe: 0.6 } },
      { id: 'q3a3', text: 'Just an emoji', tagWeights: { polished: 0.7, dry: 0.6, soft: 0.4 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'Weekend plan:',
    answers: [
      { id: 'q4a1', text: 'Touch grass maybe', tagWeights: { lazy: 0.7, soft: 0.5, cringe: 0.3 } },
      { id: 'q4a2', text: 'Cause online drama', tagWeights: { chaos: 1, troll: 0.8, loud: 0.6 } },
      { id: 'q4a3', text: 'Optimize my brand', tagWeights: { corporate: 1, polished: 0.8, cringe: 0.7 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'When roasted, you:',
    answers: [
      { id: 'q5a1', text: 'Laugh then spiral', tagWeights: { soft: 0.7, dramatic: 0.8, delulu: 0.5 } },
      { id: 'q5a2', text: 'Drop a thread', tagWeights: { hottake: 0.9, performative: 0.8, cringe: 0.6 } },
      { id: 'q5a3', text: 'Reply "ok buddy"', tagWeights: { dry: 1, troll: 0.6, cringe: 0.2 } },
    ],
  },
]
