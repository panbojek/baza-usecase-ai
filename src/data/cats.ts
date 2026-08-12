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
 * Kolory kategorii do kodowania na grafie i liście. Paleta kategorialna
 * dobrana pod ciemne (granatowe) tło grafu — wyraźnie odróżnialna, a zarazem
 * spójna wizualnie. Robotyka trzyma kolor akcentu marki (#EC7354).
 */
export const CAT_COLORS: Record<string, string> = {
  robotyka: '#EC7354',      // koral (akcent marki)
  transport: '#F4A950',     // bursztyn
  wideo: '#E9C46A',         // złoto
  oszustwa: '#E76F8E',      // róż
  zdrowie: '#5FB49C',       // morski
  marketing: '#B98CD6',     // lawenda
  praca: '#6DA8E0',         // błękit
  bezpieczenstwo: '#D0553E',// ceglasty
  spoleczenstwo: '#9AA7B5', // stalowy
  'ai-act': '#8CC152',      // zielony
}

export const catColor = (key: string): string => CAT_COLORS[key] ?? '#9AA7B5'
