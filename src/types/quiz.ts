export type TagWeights = Record<string, number>
export type Rarity = 'common' | 'rare' | 'legendary'

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
  imgflipTemplateId?: string
  roast: string
  rarity: Rarity
  tagAffinities: TagWeights
}

export interface Result {
  meme: Meme
  score: number
  matchedTags: string[]
}

export interface CompareResult {
  meme: string
  percentage: number
}
