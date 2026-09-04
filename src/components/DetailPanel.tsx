import { useMemo } from 'react'
import { useStore } from '../store'
import { catName } from '../data/cats'
import { relatedTo } from '../lib/graph'
import type { UseCase } from '../types'
import { Thumb } from './Thumb'
import { IconClose, IconExternal, IconStar } from './icons'

export function DetailPanel({ sel }: { sel: UseCase }) {
  const { state, dispatch } = useStore()
  const related = useMemo(() => relatedTo(state.items, sel), [state.items, sel])
  const linkLabel = sel.link.replace(/^https?:\/\//, '')
  const paragraphs = [sel.desc, ...sel.long.split(/\n\s*\n/)].map((s) => s.trim()).filter(Boolean)
  const fav = state.favorites.has(sel.id)

  return (
    <div className="detail">
      <div className="dhead">
        <div className="kat">{catName(sel.cat)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className={`favstar-inline ${fav ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'toggleFavorite', id: sel.id })}
            title={fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <IconStar size={16} filled={fav} />
          </button>
          <button className="xbtn" onClick={() => dispatch({ type: 'select', id: null })} title="Zamknij (Esc)">
            <IconClose />
          </button>
        </div>
      </div>

      <div className="dname">{sel.name}</div>
      <Thumb item={sel} className="dthumb" />

      <div className="dlong">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      {sel.link && (
        <a className="dlink" href={sel.link} target="_blank" rel="noopener noreferrer">
          <span>{linkLabel}</span>
          <span style={{ color: 'var(--ph-accent)', display: 'inline-flex' }}>
            <IconExternal />
          </span>
        </a>
      )}

      <div className="meta">
        <div className="k">Kategoria</div>
        <div>{catName(sel.cat)}</div>
        <div className="k">Dodano</div>
        <div className="mono">{sel.date}</div>
        <div className="k">Tagi</div>
        <div className="tags">
          {sel.tags.map((t) => (
            <button
              key={t}
              className={`tag ${state.tag === t ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'toggleTag', tag: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <div className="sec-h">Powiązane · wspólne tagi</div>
          {related.map(({ item, shared }) => (
            <div key={item.id} className="rel-item" onClick={() => dispatch({ type: 'select', id: item.id })}>
              <Thumb item={item} className="rel-thumb" />
              <div>
                <div className="rel-name">{item.name}</div>
                <div className="rel-shared">{shared.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
