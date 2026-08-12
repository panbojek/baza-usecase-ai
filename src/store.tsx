import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { UseCase, View } from './types'
import { SAMPLE_ITEMS } from './data/sampleItems'
import type { Vault } from './lib/vault'

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
      return { ...s, cat: 'all', tag: null, q: '' }
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
  const [state, dispatch] = useReducer(reducer, initial)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore poza StoreProvider')
  return ctx
}

/**
 * Selektor: wpisy po zastosowaniu filtrów (kategoria ∧ tag ∧ fraza),
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
        (!q || (i.name + ' ' + i.desc + ' ' + i.tags.join(' ')).toLowerCase().includes(q)),
    )
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export const hasActiveFilter = (s: State): boolean =>
  s.cat !== 'all' || !!s.tag || s.q.trim() !== ''
