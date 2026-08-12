import { useCallback, useEffect, useMemo } from 'react'
import { useStore, selectFiltered } from './store'
import { fsSupported, openVault, readVault, writeItem, ensureWritePermission, resolveThumbnails } from './lib/vault'
import type { UseCase } from './types'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { GridView } from './components/GridView'
import { ListView } from './components/ListView'
import { GraphView } from './components/GraphView'
import { DetailPanel } from './components/DetailPanel'
import { NewItemModal } from './components/NewItemModal'
import { EmptyState } from './components/EmptyState'

const FS_HINT =
  'Odczyt i zapis folderu .md wymaga uruchomienia przez serwer (localhost), bo przeglądarki blokują dostęp do plików z file://.\n\n' +
  'Uruchamiasz już tę aplikację przez `npm run dev` (http://127.0.0.1:5173) — jeśli mimo to widzisz ten komunikat, użyj Chrome lub Edge (Firefox/Safari nie wspierają File System Access API).'

export default function App() {
  const { state, dispatch } = useStore()
  const filtered = useMemo(() => selectFiltered(state), [state])
  const filteredIds = useMemo(() => new Set(filtered.map((i) => i.id)), [filtered])
  const sel = state.items.find((i) => i.id === state.sel) ?? null

  const handleOpenVault = useCallback(async () => {
    if (!fsSupported()) {
      alert(FS_HINT)
      return
    }
    try {
      const vault = await openVault()
      if (!vault) return
      await ensureWritePermission(vault.handle)
      const items = await readVault(vault.handle)
      if (!items.length) {
        alert('W wybranym folderze nie znaleziono plików .md z poprawnym frontmatterem (pola name + cat).')
        return
      }
      await resolveThumbnails(vault.handle, items)
      dispatch({ type: 'setItems', items, vault })
    } catch (e: any) {
      if (e?.name !== 'AbortError') alert('Błąd odczytu folderu: ' + (e?.message ?? e))
    }
  }, [dispatch])

  const persist = useCallback(
    async (item: UseCase): Promise<string | null> => {
      if (!state.vault) return null
      return await writeItem(state.vault.handle, item)
    },
    [state.vault],
  )

  // skróty klawiaturowe
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[data-search]')?.focus()
      } else if (e.key === 'Escape') {
        if (state.dialog) dispatch({ type: 'closeDialog' })
        else if (state.sel) dispatch({ type: 'select', id: null })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.dialog, state.sel, dispatch])

  return (
    <div className="app">
      <Header onOpenVault={handleOpenVault} />
      <div className="body">
        <Sidebar />
        <main className="main">
          <TopBar items={filtered} />
          <div className={`view ${state.view === 'graph' ? 'graphview' : ''}`}>
            {filtered.length === 0 ? (
              <EmptyState />
            ) : state.view === 'grid' ? (
              <GridView items={filtered} />
            ) : state.view === 'list' ? (
              <ListView items={filtered} />
            ) : (
              <GraphView items={state.items} filteredIds={filteredIds} />
            )}
          </div>
        </main>
        {sel && <DetailPanel sel={sel} />}
      </div>
      {state.dialog && <NewItemModal onPersist={persist} hasVault={!!state.vault} />}
    </div>
  )
}
