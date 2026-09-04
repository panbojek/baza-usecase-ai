import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { UseCase, View } from './types'
import { SAMPLE_ITEMS } from './data/sampleItems'
import type { Vault } from './lib/vault'

const FAV_KEY = 'baza-usecase-ai:favorites'

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export interface State {
  items: UseCase[]
  view: View
  cat: string // 'all' | CatKey
  tag: string | null
  q: string
  sel: string | null
  dialog: boolean
  vault: Vault | null
  source: 'sample' | 'vault'
  favorites: Set<string>
  favOnly: boolean
}

const initial: State = {
  items: SAMPLE_ITEMS,
  view: 'grid',
  cat: 'all',
  tag: null,
  q: '',
  sel: 'osz1',
  dialog: false,
  vault: null,
  source: 'sample',
  favorites: new Set(),
  favOnly: false,
}

type Action =
  | { type: 'setView'; view: View }
  | { type: 'setCat'; cat: string }
  | { type: 'toggleTag'; tag: string }
  | { type: 'setQuery'; q: string }
  | { type: 'select'; id: string | null }
  | { type: 'clearFilters' }
  | { type: 'openDialog' }
  | { type: 'closeDialog' }
  | { type: 'setItems'; items: UseCase[]; vault: Vault | null }
  | { type: 'addItem'; item: UseCase }
  | { type: 'toggleFavorite'; id: string }
  | { type: 'toggleFavOnly' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'setView':
      return { ...s, view: a.view }
    case 'setCat':
      return { ...s, cat: a.cat }
    case 'toggleTag':
      return { ...s, tag: s.tag === a.tag ? null : a.tag }
    case 'setQuery':
      return { ...s, q: a.q }
    case 'select':
      return { ...s, sel: a.id }
    case 'clearFilters':
      return { ...s, cat: 'all', tag: null, q: '', favOnly: false }
    case 'openDialog':
      return { ...s, dialog: true }
    case 'closeDialog':
      return { ...s, dialog: false }
    case 'setItems':
      return {
        ...s,
        items: a.items,
        vault: a.vault,
        source: a.vault ? 'vault' : 'sample',
        sel: a.items.some((i) => i.id === s.sel) ? s.sel : (a.items[0]?.id ?? null),
      }
    case 'addItem':
      return { ...s, items: [...s.items, a.item], sel: a.item.id, dialog: false }
    case 'toggleFavorite': {
      const next = new Set(s.favorites)
      if (next.has(a.id)) next.delete(a.id)
      else next.add(a.id)
      return { ...s, favorites: next }
    }
    case 'toggleFavOnly':
      return { ...s, favOnly: !s.favOnly }
    default:
      return s
  }
}

interface Store {
  state: State
  dispatch: React.Dispatch<Action>
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...initial, favorites: loadFavorites() }))
  const value = useMemo(() => ({ state, dispatch }), [state])

  // ulubione przetrwają odświeżenie strony — trwałe per przeglądarka/urządzenie
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites]))
    } catch {
      /* np. tryb prywatny bez dostępu do localStorage — pomijamy */
    }
  }, [state.favorites])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore poza StoreProvider')
  return ctx
}

/**
 * Selektor: wpisy po zastosowaniu filtrów (kategoria ∧ tag ∧ fraza ∧ ulubione),
 * posortowane malejąco po dacie — najnowsze zawsze na górze.
 * Fraza przeszukuje nazwę, opis ORAZ tagi (żeby np. „drony" znalazło wpisy z tym tagiem).
 * Daty w formacie ISO (YYYY-MM-DD), więc porównanie napisów wystarcza.
 */
export function selectFiltered(s: State): UseCase[] {
  const q = s.q.trim().toLowerCase()
  return s.items
    .filter(
      (i) =>
        (s.cat === 'all' || i.cat === s.cat) &&
        (!s.tag || i.tags.includes(s.tag)) &&
        (!s.favOnly || s.favorites.has(i.id)) &&
        (!q || (i.name + ' ' + i.desc + ' ' + i.tags.join(' ')).toLowerCase().includes(q)),
    )
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export const hasActiveFilter = (s: State): boolean =>
  s.cat !== 'all' || !!s.tag || s.q.trim() !== '' || s.favOnly
