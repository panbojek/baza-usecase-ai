import { useStore } from '../store'
import { catName } from '../data/cats'
import type { UseCase } from '../types'
import { Thumb } from './Thumb'
import { IconStar } from './icons'

export function GridView({ items }: { items: UseCase[] }) {
  const { state, dispatch } = useStore()
  return (
    <div className="grid">
      {items.map((i) => {
        const fav = state.favorites.has(i.id)
        return (
        <div
          key={i.id}
          className={`card ${state.sel === i.id ? 'sel' : ''}`}
          onClick={() => dispatch({ type: 'select', id: i.id })}
        >
          <button
            className={`favstar ${fav ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: 'toggleFavorite', id: i.id })
            }}
            title={fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <IconStar size={14} filled={fav} />
          </button>
          <Thumb item={i} label />
          <div className="card-body">
            <div className="kat">{catName(i.cat)}</div>
            <div className="card-name">{i.name}</div>
            <div className="card-desc">{i.desc}</div>
            <div className="card-foot">
              {i.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
              <span className="card-date">{i.date}</span>
            </div>
          </div>
        </div>
        )
      })}
    </div>
  )
}
