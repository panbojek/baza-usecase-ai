import type { GraphLink, GraphNode, UseCase } from '../types'

export interface Edge {
  a: string
  b: string
  n: number
  shared: string[]
}

/** Krawędź między dwoma wpisami istnieje, gdy mają ≥1 wspólny tag. Waga = liczba wspólnych tagów. */
export function allEdges(items: UseCase[]): Edge[] {
  const out: Edge[] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const shared = items[i].tags.filter((t) => items[j].tags.includes(t))
      if (shared.length) out.push({ a: items[i].id, b: items[j].id, n: shared.length, shared })
    }
  }
  return out
}

/** Stopień węzła = liczba krawędzi. */
export function degreeMap(items: UseCase[]): Record<string, number> {
  const deg: Record<string, number> = {}
  for (const e of allEdges(items)) {
    deg[e.a] = (deg[e.a] ?? 0) + 1
    deg[e.b] = (deg[e.b] ?? 0) + 1
  }
  return deg
}

/** Dane dla react-force-graph (liczone z pełnego zbioru, filtr steruje wygaszaniem). */
export function toGraphData(items: UseCase[]): { nodes: GraphNode[]; links: GraphLink[] } {
  const deg = degreeMap(items)
  const nodes: GraphNode[] = items.map((i) => {
    const d = deg[i.id] ?? 0
    return { id: i.id, name: i.name, cat: i.cat, deg: d, val: 7 + Math.min(6, d * 0.9) }
  })
  const links: GraphLink[] = allEdges(items).map((e) => ({
    source: e.a,
    target: e.b,
    n: e.n,
    shared: e.shared,
  }))
  return { nodes, links }
}

export const uniqueTags = (items: UseCase[]): string[] =>
  [...new Set(items.flatMap((i) => i.tags))].sort((a, b) => a.localeCompare(b, 'pl'))

/** Wpisy powiązane z zaznaczonym przez wspólne tagi (do panelu szczegółu). */
export function relatedTo(items: UseCase[], sel: UseCase, limit = 4) {
  return items
    .filter((i) => i.id !== sel.id && i.tags.some((t) => sel.tags.includes(t)))
    .slice(0, limit)
    .map((i) => ({ item: i, shared: i.tags.filter((t) => sel.tags.includes(t)) }))
}
