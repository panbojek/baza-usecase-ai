import { useEffect, useRef } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import { catColor } from '../data/cats'
import type { GraphLink, GraphNode } from '../types'

const endpointId = (v: any): string => (typeof v === 'object' && v ? v.id : v)

interface Props {
  data: { nodes: GraphNode[]; links: GraphLink[] }
  width: number
  height: number
  filteredIds: Set<string>
  sel: string | null
  onSelect: (id: string) => void
}

export function Graph3D({ data, width, height, filteredIds, sel, onSelect }: Props) {
  const fgRef = useRef<any>(null)
  const fitted = useRef(false)

  useEffect(() => {
    fitted.current = false
  }, [data])

  // OrbitControls: zoom kółkiem podąża za kursorem (jak w widoku 2D),
  // zamiast zawsze przybliżać do środka sceny. Kontrolki bywają gotowe
  // dopiero po kilku klatkach, więc ustawiamy z ponawianiem.
  useEffect(() => {
    let raf = 0
    let tries = 0
    const apply = () => {
      const controls = fgRef.current?.controls?.()
      if (controls && 'zoomToCursor' in controls) {
        controls.zoomToCursor = true
        return
      }
      if (tries++ < 60) raf = requestAnimationFrame(apply)
    }
    apply()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <ForceGraph3D
      ref={fgRef}
      width={width}
      height={height}
      graphData={data}
      backgroundColor="#1F293C"
      controlType="orbit"
      showNavInfo={false}
      nodeRelSize={4}
      nodeVal={(n: any) => 1 + n.deg * 0.7}
      nodeOpacity={0.95}
      nodeResolution={16}
      nodeColor={(n: any) =>
        n.id === sel ? '#FFFFFF' : filteredIds.has(n.id) ? catColor(n.cat) : 'rgba(255,255,255,0.18)'
      }
      linkColor={(l: any) => {
        const on = sel && (endpointId(l.source) === sel || endpointId(l.target) === sel)
        const vis = filteredIds.has(endpointId(l.source)) && filteredIds.has(endpointId(l.target))
        return on ? '#EC7354' : vis ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.06)'
      }}
      linkWidth={(l: any) => {
        const on = sel && (endpointId(l.source) === sel || endpointId(l.target) === sel)
        return on ? 1.4 : 0.4
      }}
      linkOpacity={0.65}
      onNodeClick={(n: any) => onSelect(n.id)}
      onEngineStop={() => {
        if (!fitted.current) {
          fgRef.current?.zoomToFit(600, 60)
          fitted.current = true
        }
      }}
      nodeThreeObjectExtend={true}
      nodeThreeObject={(n: any) => {
        // etykieta tylko dla węzłów w filtrze albo zaznaczonego — mniej bałaganu w 3D
        const on = n.id === sel
        if (!(filteredIds.has(n.id) || on)) return undefined as any
        const label = n.name.length > 26 ? n.name.slice(0, 25) + '…' : n.name
        const sprite: any = new SpriteText(label)
        sprite.color = on ? '#FFFFFF' : 'rgba(255,255,255,0.78)'
        sprite.textHeight = on ? 5 : 4
        sprite.fontFace = 'Sora, sans-serif'
        sprite.fontWeight = on ? '600' : '500'
        sprite.position.y = 8 + n.deg * 0.7
        sprite.material.depthWrite = false
        return sprite
      }}
    />
  )
}
