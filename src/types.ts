export type CatKey =
  | 'robotyka'
  | 'transport'
  | 'wideo'
  | 'oszustwa'
  | 'zdrowie'
  | 'marketing'
  | 'praca'
  | 'bezpieczenstwo'
  | 'spoleczenstwo'
  | 'ai-act'

export interface Cat {
  key: CatKey
  name: string
}

export interface UseCase {
  id: string
  name: string
  cat: CatKey
  tags: string[]
  date: string // ISO YYYY-MM-DD
  link: string
  thumbnail?: string
  desc: string // krótki opis (1. akapit treści)
  long: string // opis rozszerzony (reszta treści)
  /** względna ścieżka pliku .md w vaulcie, jeśli wczytany z dysku */
  path?: string
}

export type View = 'grid' | 'list' | 'graph'

export interface GraphNode {
  id: string
  name: string
  cat: CatKey
  deg: number
  val: number
  x?: number
  y?: number
}

export interface GraphLink {
  source: string
  target: string
  n: number
  shared: string[]
}
