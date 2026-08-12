import { useStore } from '../store'
import { catName, catColor } from '../data/cats'
import type { UseCase } from '../types'
import { Thumb } from './Thumb'
import { IconExternal } from './icons'

export function ListView({ items }: { items: UseCase[] }) {
  const { state, dispatch } = useStore()
  return (
    <div className="list">
      {items.map((i) => (
        <div
          key={i.id}
          className={`row ${state.sel === i.id ? 'sel' : ''}`}
          onClick={() => dispatch({ type: 'select', id: i.id })}
        >
          <Thumb item={i} className="rthumb" />
          <div className="rtext">
            <div className="rname">{i.name}</div>
            <div className="rdesc">{i.desc}</div>
          </div>
          <div className="rtags">
            {i.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div className="rkat" style={{ color: catColor(i.cat) }}>
            <span className="catdot" style={{ background: catColor(i.cat) }} />
            {catName(i.cat)}
          </div>
          <div className="rdate">{i.date}</div>
          <a
            className="rlink"
            href={i.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Otwórz źródło"
          >
            <IconExternal />
          </a>
        </div>
      ))}
    </div>
  )
}
