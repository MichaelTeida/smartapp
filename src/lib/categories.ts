import type { CategoryData } from '@/types/quiz'

import Programowanie from '../../data/categories/Programowanie.json'
import IT from '../../data/categories/IT.json'
import React from '../../data/categories/React.json'
import TestRekruter from '../../data/categories/Test_od_rekrutera_IT.json'
import Informatyka from '../../data/categories/Informatyka.json'
import JezykPolski from '../../data/categories/Jezyk_Polski.json'
import Biologia from '../../data/categories/Biologia.json'
import Matematyka from '../../data/categories/Matematyka.json'
import Geografia from '../../data/categories/Geografia.json'

const categories: CategoryData[] = [
  Programowanie,
  IT,
  React,
  TestRekruter,
  Informatyka,
  JezykPolski,
  Biologia,
  Matematyka,
  Geografia,
] as CategoryData[]

export function getCategories(): CategoryData[] {
  return categories
}

export function getCategoryByName(name: string): CategoryData | undefined {
  return categories.find(c => c.category === name)
}

export function getCategoryNames(): string[] {
  return categories.map(c => c.category)
}
