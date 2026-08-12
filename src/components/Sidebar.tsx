import { useMemo } from 'react'
import { useStore } from '../store'
import { CATS, catColor } from '../data/cats'
import { allEdges, uniqueTags } from '../lib/graph'

export function Sidebar() {
  const { state, dispatch } = useStore()

  const cats = useMemo(
    () => [
      { key: 'all', name: 'Wszystkie', count: state.items.length },
      ...CATS.map((c) => ({
        key: c.key,
        name: c.name,
        count: state.items.filter((i) => i.cat === c.key).length,
      })),
    ],
    [state.items],
  )
  const tags = useMemo(() => uniqueTags(state.items), [state.items])
  const edgeCount = useMemo(() => allEdges(state.items).length, [state.items])

  return (
    <aside className="sidebar">
      <div>
        <div className="sec-h">Kategorie</div>
        {cats.map((c) => (
          <button
            key={c.key}
            className={`catbtn ${state.cat === c.key ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'setCat', cat: c.key })}
          >
            <span className="catlabel">
              <span
                className="catdot"
                style={{ background: c.key === 'all' ? 'transparent' : catColor(c.key), boxShadow: c.key === 'all' ? 'none' : undefined }}
              />
              <span className="catname">{c.name}</span>
            </span>
            <span className="cnt">{c.count}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="sec-h">Tagi</div>
        <div className="tags">
          {tags.map((t) => (
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

      <div className="side-foot">
        // {state.items.length} wpisów · {edgeCount} powiązań
        <br />
        // źródło: {state.source === 'vault' ? `folder „${state.vault?.name}"` : 'dane wbudowane'}
      </div>
    </aside>
  )
}
