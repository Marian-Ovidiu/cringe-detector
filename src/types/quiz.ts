export type TagWeights = Record<string, number>

export interface Answer {
  id: string
  text: string
  tagWeights: TagWeights
}

export interface Question {
  id: string
  prompt: string
  answers: Answer[]
}

export interface Meme {
  id: string
  title: string
  imageUrl: string
  roast: string
  tagAffinities: TagWeights
}

export interface Result {
  meme: Meme
  score: number
  matchedTags: string[]
}
