import { useState, type KeyboardEvent } from 'react'
import { useStore } from '../store'
import { CATS } from '../data/cats'
import type { CatKey, UseCase } from '../types'
import { slugFallback } from '../lib/md'
import { IconClose } from './icons'

interface Props {
  /** Zapis do pliku .md (jeśli wczytany folder). Zwraca ścieżkę lub null. */
  onPersist: (item: UseCase) => Promise<string | null>
  hasVault: boolean
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export function NewItemModal({ onPersist, hasVault }: Props) {
  const { state, dispatch } = useStore()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState<CatKey>('robotyka')
  const [date, setDate] = useState(todayISO())
  const [link, setLink] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const close = () => dispatch({ type: 'closeDialog' })

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,$/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1))
    }
  }

  const existingTags = [...new Set(state.items.flatMap((i) => i.tags))].sort((a, b) => a.localeCompare(b, 'pl'))

  const save = async () => {
    setErr('')
    if (!name.trim() || !cat || !link.trim()) {
      setErr('Wymagane: nazwa, kategoria, link.')
      return
    }
    try {
      new URL(link)
    } catch {
      setErr('Link musi być poprawnym adresem URL (z http/https).')
      return
    }
    const pendingTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags
    const id = slugFallback(name)
    const item: UseCase = {
      id: state.items.some((i) => i.id === id) ? `${id}-${Date.now().toString(36)}` : id,
      name: name.trim(),
      cat,
      tags: pendingTags,
      date: date.trim() || todayISO(),
      link: link.trim(),
      desc: desc.trim(),
      long: '',
    }
    setSaving(true)
    try {
      const path = await onPersist(item)
      if (path) item.path = path
    } catch (e: any) {
      setErr('Wpis dodano w aplikacji, ale zapis do pliku się nie powiódł: ' + (e?.message ?? e))
      setSaving(false)
      dispatch({ type: 'addItem', item })
      return
    }
    setSaving(false)
    dispatch({ type: 'addItem', item })
  }

  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Nowy use-case</h2>
          <button className="xbtn" onClick={close}>
            <IconClose />
          </button>
        </div>

        <div style={{ height: 18 }} />

        <div className="field">
          <label className="req">Nazwa</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Deepfake prezesa na callu" autoFocus />
        </div>

        <div className="field">
          <label>Krótki opis</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="1–2 zdania widoczne na karcie" />
        </div>

        <div className="two">
          <div className="field">
            <label className="req">Kategoria</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as CatKey)}>
              {CATS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field mono">
            <label>Data</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="RRRR-MM-DD" />
          </div>
        </div>

        <div className="field mono">
          <label className="req">Link źródłowy</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
        </div>

        <div className="field">
          <label>Tagi</label>
          <div className="chips-input">
            {tags.map((t) => (
              <span key={t} className="tagchip">
                {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} title="Usuń">
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKey}
              onBlur={() => tagInput.trim() && addTag(tagInput)}
              placeholder="dodaj tag…"
              list="taglist"
            />
            <datalist id="taglist">
              {existingTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>

        {err && <div className="hint err">{err}</div>}
        {!hasVault && (
          <div className="hint">
            Bez wczytanego folderu wpis dodaje się tylko w aplikacji (nie zapisze się do pliku .md).
          </div>
        )}

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={close} disabled={saving}>
            Anuluj
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Zapisywanie…' : 'Zapisz wpis'}
          </button>
        </div>
      </div>
    </div>
  )
}
