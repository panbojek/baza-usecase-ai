import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { toGraphData } from '../lib/graph'
import type { UseCase } from '../types'
import { Graph2D, type GraphHandle } from './Graph2D'

// three.js doładowuje się dopiero po przełączeniu na 3D
const Graph3D = lazy(() => import('./Graph3D').then((m) => ({ default: m.Graph3D })))

/** Mierzy rozmiar kontenera (grafy potrzebują jawnych width/height). */
function useMeasure() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])
  return { ref, size }
}

type Mode = '2d' | '3d'

export function GraphView({ items, filteredIds }: { items: UseCase[]; filteredIds: Set<string> }) {
  const { state, dispatch } = useStore()
  const { ref, size } = useMeasure()
  const [mode, setMode] = useState<Mode>('2d')
  const graphRef = useRef<GraphHandle>(null)

  const data = useMemo(() => toGraphData(items), [items])
  const onSelect = (id: string) => dispatch({ type: 'select', id })
  const shared = { data, width: size.w, height: size.h, filteredIds, sel: state.sel, onSelect }

  return (
    <div className="graphwrap" ref={ref}>
      {size.w > 0 && (
        // key={mode} wymusza pełny unmount poprzedniego grafu (i jego canvasu)
        // przed montażem kolejnego — brak reużycia kontekstu 2D/WebGL
        <div key={mode} style={{ position: 'absolute', inset: 0 }}>
          {mode === '2d' ? (
            <Graph2D ref={graphRef} {...shared} />
          ) : (
            <Suspense fallback={<div className="gloading mono">// ładowanie widoku 3D…</div>}>
              <Graph3D ref={graphRef} {...shared} />
            </Suspense>
          )}
        </div>
      )}

      <div className="gmode">
        <button className={mode === '2d' ? 'active' : ''} onClick={() => setMode('2d')}>
          2D
        </button>
        <button className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}>
          3D
        </button>
        <button className="greset" onClick={() => graphRef.current?.resetView()} title="Reset widoku">
          ⟲ Reset
        </button>
      </div>
      <div className="ghint">
        {mode === '2d'
          ? 'przeciągnij węzeł • przeciągnij tło = przesuń • kółko = zoom'
          : 'przeciągnij = obróć scenę • kółko = zoom • prawy przycisk = przesuń'}
      </div>
      <div className="legend">
        // kolor węzła = kategoria
        <br />
        // krawędź = wspólny tag
        <br />
        // wielkość węzła = liczba powiązań
      </div>
    </div>
  )
}
