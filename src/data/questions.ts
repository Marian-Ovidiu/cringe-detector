import type { Question } from '../types/quiz'

export const questions: Question[] = [
  {
    id: 'q1',
    prompt: 'Quando qualcuno ti risponde solo "ok"',
    answers: [
      { id: 'q1a1', text: 'mi odia.', tagWeights: { dramatic: 0.9, delulu: 0.8, cringe: 0.6 } },
      { id: 'q1a2', text: 'ok pure io.', tagWeights: { dry: 1, soft: 0.3, cringe: 0.2 } },
      { id: 'q1a3', text: 'spammo altri 3 messaggi', tagWeights: { loud: 0.8, performative: 0.7, cringe: 0.7 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'Sei a una festa',
    answers: [
      { id: 'q2a1', text: 'parlo troppo', tagWeights: { loud: 0.9, chaos: 0.4, cringe: 0.6 } },
      { id: 'q2a2', text: 'sto nel mio angolo', tagWeights: { soft: 0.8, lazy: 0.4, cringe: 0.3 } },
      { id: 'q2a3', text: 'fingo di stare al telefono', tagWeights: { dry: 0.6, delulu: 0.4, cringe: 0.5 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'Il tuo humor e',
    answers: [
      { id: 'q3a1', text: 'brainrot puro', tagWeights: { chaos: 1, troll: 0.7, cringe: 0.8 } },
      { id: 'q3a2', text: 'ironico (credo)', tagWeights: { dry: 0.9, polished: 0.4, cringe: 0.4 } },
      { id: 'q3a3', text: 'non lo so bro', tagWeights: { soft: 0.5, delulu: 0.6, cringe: 0.5 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'Quando fai una figuraccia',
    answers: [
      { id: 'q4a1', text: 'ci rido sopra', tagWeights: { soft: 0.6, dry: 0.6, cringe: 0.2 } },
      { id: 'q4a2', text: 'ci penso per 3 anni', tagWeights: { dramatic: 1, delulu: 0.5, cringe: 0.7 } },
      { id: 'q4a3', text: 'faccio peggio', tagWeights: { chaos: 0.9, impulsive: 0.8, cringe: 0.8 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'Online sei',
    answers: [
      { id: 'q5a1', text: 'sempre presente', tagWeights: { performative: 0.9, corporate: 0.5, cringe: 0.7 } },
      { id: 'q5a2', text: 'lurker silenzioso', tagWeights: { soft: 0.8, polished: 0.5, lazy: 0.5 } },
      { id: 'q5a3', text: 'commento tutto', tagWeights: { hottake: 0.9, troll: 0.8, cringe: 0.7 } },
    ],
  },
]
