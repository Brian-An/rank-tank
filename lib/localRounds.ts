import type { Category, Theme } from './types'
import { pickIndex } from './seed'

import techCategories from '../data/categories/tech.json'
import musicCategories from '../data/categories/music.json'
import geographyCategories from '../data/categories/geography.json'
import sportsCategories from '../data/categories/sports.json'
import businessCategories from '../data/categories/business.json'
import scienceCategories from '../data/categories/science.json'
import moviesCategories from '../data/categories/movies.json'

const ALL_CATEGORIES = [
  ...(techCategories as Category[]),
  ...(musicCategories as Category[]),
  ...(geographyCategories as Category[]),
  ...(sportsCategories as Category[]),
  ...(businessCategories as Category[]),
  ...(scienceCategories as Category[]),
  ...(moviesCategories as Category[]),
]

const BY_THEME: Record<Theme, Category[]> = {
  tech: techCategories as Category[],
  music: musicCategories as Category[],
  geography: geographyCategories as Category[],
  sports: sportsCategories as Category[],
  business: businessCategories as Category[],
  science: scienceCategories as Category[],
  movies: moviesCategories as Category[],
}

export function getLocalRound(seed: string, theme?: Theme): Category {
  const pool = theme ? BY_THEME[theme] : ALL_CATEGORIES
  const idx = pickIndex(pool.length, seed)
  return pool[idx]
}
