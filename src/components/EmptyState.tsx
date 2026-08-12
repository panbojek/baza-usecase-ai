import { useStore } from '../store'

export function EmptyState() {
  const { dispatch } = useStore()
  return (
    <div className="empty">
      <div className="disp">Brak wyników</div>
      <p>Zmień kategorię, tag albo frazę wyszukiwania.</p>
      <button className="btn btn-secondary" onClick={() => dispatch({ type: 'clearFilters' })}>
        Wyczyść filtry
      </button>
    </div>
  )
}
