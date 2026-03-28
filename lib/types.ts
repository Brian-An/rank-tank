export type Theme = 'tech' | 'music' | 'geography' | 'sports' | 'business' | 'science' | 'movies'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface RankItem {
  id: string
  label: string
  value: number
  display: string
}

export interface Category {
  id: string
  title: string
  theme: Theme
  difficulty: Difficulty
  unit: string
  items: RankItem[]   // in correct order: rank 1 (highest/best) first
  source?: string
}

export interface Round {
  category: Category
  shuffledItems: RankItem[]
  seed: string
}

export interface ScoreResult {
  score: number        // 0–100
  correctPairs: number
  totalPairs: number
  perfect: boolean
}

export interface CommentaryResult {
  text: string
  isAI: boolean
}
