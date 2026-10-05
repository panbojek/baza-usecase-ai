import type { Cat } from '../types'

/** Kategorie use-case'ów. Kolejność steruje układem w sidebarze i klastrami w grafie. */
export const CATS: Cat[] = [
  { key: 'robotyka', name: 'Robotyka' },
  { key: 'transport', name: 'Autonomia i transport' },
  { key: 'wideo', name: 'Wideo i obraz' },
  { key: 'oszustwa', name: 'Deepfake i oszustwa' },
  { key: 'zdrowie', name: 'Zdrowie' },
  { key: 'marketing', name: 'Marketing i wirtualne postacie' },
  { key: 'praca', name: 'Praca, biznes i agenci' },
  { key: 'bezpieczenstwo', name: 'Bezpieczeństwo i obronność' },
  { key: 'spoleczenstwo', name: 'Administracja i społeczeństwo' },
  { key: 'ai-act', name: 'AI Act' },
]

export const catName = (key: string): string =>
  CATS.find((c) => c.key === key)?.name ?? ''

/**
 * Kolory kategorii do kodowania na grafie i liście — świadomy wyjątek od monochromu KV:
 * to kodowanie danych, nie akcent marki. Paleta dobrana pod ciemne tło grafu.
 */
export const CAT_COLORS: Record<string, string> = {
  robotyka: '#EC7354',
  transport: '#F4A950',
  wideo: '#E9C46A',
  oszustwa: '#E76F8E',
  zdrowie: '#5FB49C',
  marketing: '#B98CD6',
  praca: '#6DA8E0',
  bezpieczenstwo: '#D0553E',
  spoleczenstwo: '#9AA7B5',
  'ai-act': '#8CC152',
}

export const catColor = (key: string): string => CAT_COLORS[key] ?? '#9AA7B5'
