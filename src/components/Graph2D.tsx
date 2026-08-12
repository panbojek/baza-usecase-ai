import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { forceX, forceY } from 'd3-force-3d'
import { catColor } from '../data/cats'
import type { GraphLink, GraphNode } from '../types'

const endpointId = (v: any): string => (typeof v === 'object' && v ? v.id : v)

export interface GraphHandle {
  resetView: () => void
}

interface Props {
  data: { nodes: GraphNode[]; links: GraphLink[] }
  width: number
  height: number
  filteredIds: Set<string>
  sel: string | null
  onSelect: (id: string) => void
}

export const Graph2D = forwardRef<GraphHandle, Props>(function Graph2D(
  { data, width, height, filteredIds, sel, onSelect },
  ref,
) {
  const fgRef = useRef<any>(null)
  const fitted = useRef(false)
  const [hovered, setHovered] = useState<string | null>(null)

  // Reset: odepnij przeciągnięte węzły, ponów układ i dopasuj kadr.
  useImperativeHandle(ref, () => ({
    resetView() {
      const fg = fgRef.current
      if (!fg) return
      data.nodes.forEach((n: any) => {
        n.fx = null
        n.fy = null
      })
      fg.d3ReheatSimulation?.()
      fitted.current = false
      setTimeout(() => fg.zoomToFit?.(500, 60), 60)
    },
  }))

  // układ sił + dopasowanie widoku raz na zestaw danych
  useEffect(() => {
    fitted.current = false
    const fg = fgRef.current
    if (!fg) return
    // umiarkowane odpychanie (dość, by rozdzielić kropki, nie tyle, by rozrzucić wyspy)
    fg.d3Force('charge')?.strength(-60)
    // luźniejsze klastry: dłuższe, słabsze krawędzie (bliżej przewiewnego 3D)
    fg.d3Force('link')?.distance(42).strength(0.22)
    // delikatniejsze przyciąganie do środka — mniej ściśnięcia, wciąż trzyma wyspy przy rdzeniu
    fg.d3Force('x', forceX(0).strength(0.045))
    fg.d3Force('y', forceY(0).strength(0.045))
    fg.d3ReheatSimulation?.()
  }, [data])

  return (
    <ForceGraph2D
      ref={fgRef}
      width={width}
      height={height}
      graphData={data}
      backgroundColor="#1F293C"
      nodeRelSize={5}
      cooldownTicks={160}
      d3VelocityDecay={0.34}
      nodeLabel={() => ''}
      onNodeHover={(n: any) => setHovered(n ? n.id : null)}
      onEngineStop={() => {
        if (!fitted.current) {
          fgRef.current?.zoomToFit(400, 60)
          fitted.current = true
        }
      }}
      linkColor={(l: any) => {
        const on = sel && (endpointId(l.source) === sel || endpointId(l.target) === sel)
        const vis = filteredIds.has(endpointId(l.source)) && filteredIds.has(endpointId(l.target))
        return on ? '#EC7354' : vis ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)'
      }}
      linkWidth={(l: any) => {
        const on = sel && (endpointId(l.source) === sel || endpointId(l.target) === sel)
        return on ? 1.6 : l.n > 1 ? 0.9 : 0.6
      }}
      onNodeClick={(n: any) => onSelect(n.id)}
      nodePointerAreaPaint={(n: any, color: string, ctx: CanvasRenderingContext2D) => {
        const r = 2.5 + Math.min(4.5, n.deg * 0.55) + 4
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, 2 * Math.PI)
        ctx.fill()
      }}
      nodeCanvasObject={(n: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const inFilter = filteredIds.has(n.id)
        const on = n.id === sel
        const hov = n.id === hovered
        const active = on || hov
        // mniejsze kropki
        const r = 2.5 + Math.min(4.5, n.deg * 0.55)
        const rr = active ? r + 2 : r
        const color = catColor(n.cat)
        ctx.globalAlpha = inFilter ? 1 : 0.14

        ctx.beginPath()
        ctx.arc(n.x, n.y, rr, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()
        ctx.lineWidth = (active ? 1.8 : 0.8) / globalScale
        ctx.strokeStyle = active ? '#FFFFFF' : 'rgba(255,255,255,0.28)'
        ctx.stroke()

        // Etykiety widoczne od razu (spójnie z 3D). Rozmiar w JEDNOSTKACH ŚWIATA
        // (nie ekranu) — tak jak sprite'y w 3D: na overview drobne, przy
        // przybliżaniu rosną. Zaznaczony/najechany — biały, nieco większy.
        const showLabel = inFilter
        if (showLabel) {
          const label = n.name.length > 24 ? n.name.slice(0, 23) + '…' : n.name
          const fontSize = active ? 5 : 3.8
          ctx.font = `${active ? 600 : 500} ${fontSize}px Sora, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          const y = n.y - rr - 1.5
          ctx.fillStyle = active ? '#FFFFFF' : 'rgba(255,255,255,0.85)'
          ctx.fillText(label, n.x, y)
        }
        ctx.globalAlpha = 1
      }}
    />
  )
})
