import type { MemeOption } from '../types/meme'

export function getTotalCringe(options: MemeOption[]): number {
  return options.reduce((sum, option) => sum + option.cringeScore, 0)
}
