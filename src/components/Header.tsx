import { useRef } from 'react'
import { useStore } from '../store'
import type { View } from '../types'
import { IconGrid, IconList, IconGraph, IconSearch, IconFolder } from './icons'

interface Props {
  onOpenVault: () => void
}

export function Header({ onOpenVault }: Props) {
  const { state, dispatch } = useStore()
  const searchRef = useRef<HTMLInputElement>(null)

  const views: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'grid', label: 'Siatka', icon: <IconGrid /> },
    { key: 'list', label: 'Lista', icon: <IconList /> },
    { key: 'graph', label: 'Graf', icon: <IconGraph /> },
  ]

  return (
    <header className="header">
      <div className="logo">
        PROCESS<b>HUB</b>
      </div>
      <div className="vbar" />
      <div className="apptitle">Baza use-casów AI</div>

      <div className="search">
        <IconSearch />
        <input
          ref={searchRef}
          data-search
          placeholder="Szukaj w bazie…"
          value={state.q}
          onChange={(e) => dispatch({ type: 'setQuery', q: e.target.value })}
        />
      </div>

      <div className="spacer" />

      <div className="switch">
        {views.map((v) => (
          <button
            key={v.key}
            className={state.view === v.key ? 'active' : ''}
            title={v.label}
            aria-pressed={state.view === v.key}
            onClick={() => dispatch({ type: 'setView', view: v.key })}
          >
            {v.icon}
          </button>
        ))}
      </div>

      {/* Edycja bazy tylko lokalnie (dev). Na wersji webowej (produkcja) te przyciski
          są ukryte — treść jest wbudowana w build, a nowe wpisy dodajemy przez repo. */}
      {import.meta.env.DEV && (
        <>
          <button className="btn btn-ghost" onClick={onOpenVault} title="Wczytaj folder z plikami .md">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <IconFolder /> Folder .md
            </span>
          </button>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'openDialog' })}>
            + Nowy wpis
          </button>
        </>
      )}
    </header>
  )
}
