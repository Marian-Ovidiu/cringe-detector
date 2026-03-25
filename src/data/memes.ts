import type { Meme } from '../types/quiz'

export const memes: Meme[] = [
  {
    id: 'npc-scroll',
    title: 'NPC Scroll Goblin',
    imageUrl: '/memes/npc-scroll.jpg',
    roast: 'Thumb speed: elite. Life direction: buffering.',
    tagAffinities: { doomscroll: 0.9, lazy: 0.5, cringe: 0.7, chaos: 0.3 },
  },
  {
    id: 'gym-philosopher',
    title: 'Gym Philosopher',
    imageUrl: '/memes/gym-philosopher.jpg',
    roast: 'You lift weights and unsolicited opinions.',
    tagAffinities: { alpha: 0.8, performative: 0.6, delulu: 0.2, cringe: 0.5 },
  },
  {
    id: 'linkedin-warrior',
    title: 'LinkedIn Main Character',
    imageUrl: '/memes/linkedin-warrior.jpg',
    roast: 'Every post reads like a business school breakup letter.',
    tagAffinities: { corporate: 1, performative: 0.8, cringe: 0.9, polished: 0.7 },
  },
  {
    id: 'sad-boi-editor',
    title: 'Sad Boi Editor',
    imageUrl: '/memes/sad-boi-editor.jpg',
    roast: 'You romanticize every minor inconvenience in 4K.',
    tagAffinities: { dramatic: 1, soft: 0.7, delulu: 0.6, cringe: 0.5 },
  },
  {
    id: 'chaotic-gremlin',
    title: 'Chaotic Gremlin',
    imageUrl: '/memes/chaotic-gremlin.jpg',
    roast: 'You are not random, you are predictable chaos.',
    tagAffinities: { chaos: 1, loud: 0.8, impulsive: 0.7, cringe: 0.6 },
  },
  {
    id: 'ratio-magnet',
    title: 'Ratio Magnet',
    imageUrl: '/memes/ratio-magnet.jpg',
    roast: 'You do not seek truth, you seek notifications.',
    tagAffinities: { hottake: 1, loud: 0.6, troll: 0.8, cringe: 0.7 },
  },
  {
    id: 'minimalist-judge',
    title: 'Minimalist Judge',
    imageUrl: '/memes/minimalist-judge.jpg',
    roast: 'Clean feed, messy superiority complex.',
    tagAffinities: { polished: 0.9, dry: 0.8, corporate: 0.4, cringe: 0.2 },
  },
  {
    id: 'delulu-royalty',
    title: 'Delulu Royalty',
    imageUrl: '/memes/delulu-royalty.jpg',
    roast: 'Your confidence is impressive and mostly fictional.',
    tagAffinities: { delulu: 1, dramatic: 0.8, soft: 0.5, cringe: 0.9 },
  },
  {
    id: 'boomer-capslock',
    title: 'Boomer Capslock',
    imageUrl: '/memes/boomer-capslock.jpg',
    roast: 'You type like every sentence is a fire drill.',
    tagAffinities: { loud: 1, hottake: 0.7, dry: 0.2, cringe: 0.8 },
  },
  {
    id: 'aesthetic-lurker',
    title: 'Aesthetic Lurker',
    imageUrl: '/memes/aesthetic-lurker.jpg',
    roast: 'Soft palette, hard commitment to avoiding eye contact.',
    tagAffinities: { soft: 0.8, polished: 0.7, lazy: 0.6, cringe: 0.4 },
  },
]
