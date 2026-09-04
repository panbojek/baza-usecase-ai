import { useStore, hasActiveFilter } from '../store'
import { catName } from '../data/cats'
import type { UseCase } from '../types'

export function TopBar({ items }: { items: UseCase[] }) {
  const { state, dispatch } = useStore()
  const heading = state.cat === 'all' ? 'Wszystkie use-case’y' : catName(state.cat)
  const count = `// ${items.length} ${items.length === 1 ? 'wpis' : 'wpisów'}${state.tag ? ' · tag: ' + state.tag : ''}${state.favOnly ? ' · ulubione' : ''}`

  return (
    <div className="topbar">
      <h1>{heading}</h1>
      <span className="cl">{count}</span>
      {hasActiveFilter(state) && (
        <button className="clearf" onClick={() => dispatch({ type: 'clearFilters' })}>
          Wyczyść filtry ×
        </button>
      )}
    </div>
  )
}
