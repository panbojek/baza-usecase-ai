import type { UseCase } from '../types'
import { parseMd, serializeMd } from './md'

/**
 * Warstwa dostępu do folderu z plikami .md (File System Access API).
 * Wymaga bezpiecznego kontekstu (localhost / https) — na file:// niedostępne.
 */

export const fsSupported = (): boolean =>
  typeof (window as any).showDirectoryPicker === 'function'

export interface Vault {
  handle: FileSystemDirectoryHandle
  name: string
}

export async function openVault(): Promise<Vault | null> {
  if (!fsSupported()) return null
  const handle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker({
    id: 'baza-usecase-ai',
    mode: 'readwrite',
  })
  return { handle, name: handle.name }
}

/** Rekurencyjnie czyta wszystkie pliki .md (pomija README.md i folder thumbnails). */
export async function readVault(dir: FileSystemDirectoryHandle, prefix = ''): Promise<UseCase[]> {
  const out: UseCase[] = []
  // @ts-expect-error — values() jest AsyncIterable w środowisku przeglądarki
  for await (const entry of dir.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
      const file = await (entry as FileSystemFileHandle).getFile()
      const text = await file.text()
      const item = parseMd(text, prefix + entry.name)
      if (item) out.push(item)
    } else if (entry.kind === 'directory' && entry.name !== 'thumbnails' && !entry.name.startsWith('.')) {
      const sub = await readVault(entry as FileSystemDirectoryHandle, prefix + entry.name + '/')
      out.push(...sub)
    }
  }
  return out
}

/**
 * Zapisuje wpis do pliku .md. Umieszcza go w podfolderze kategorii (tworzy go, jeśli trzeba).
 * Zwraca względną ścieżkę zapisanego pliku.
 */
export async function writeItem(dir: FileSystemDirectoryHandle, item: UseCase): Promise<string> {
  let target = dir
  try {
    target = await dir.getDirectoryHandle(item.cat, { create: true })
  } catch {
    /* zapis płasko w korzeniu, jeśli podfolder się nie uda */
  }
  const filename = item.id + '.md'
  const fh = await target.getFileHandle(filename, { create: true })
  const writable = await fh.createWritable()
  await writable.write(serializeMd(item))
  await writable.close()
  return (target === dir ? '' : item.cat + '/') + filename
}

/**
 * Zamienia względne ścieżki miniatur (thumbnails/x.jpg) na obiektowe URL-e,
 * czytając pliki z podfolderu `thumbnails/` w vaulcie. Zdalne URL-e i puste pomija.
 */
export async function resolveThumbnails(dir: FileSystemDirectoryHandle, items: UseCase[]): Promise<void> {
  let thumbsDir: FileSystemDirectoryHandle
  try {
    thumbsDir = await dir.getDirectoryHandle('thumbnails')
  } catch {
    return // brak folderu thumbnails — nic do zrobienia
  }
  for (const it of items) {
    if (!it.thumbnail || /^(https?:)?\//.test(it.thumbnail)) continue
    const file = it.thumbnail.replace(/^thumbnails\//, '')
    try {
      const fh = await thumbsDir.getFileHandle(file)
      it.thumbnail = URL.createObjectURL(await fh.getFile())
    } catch {
      it.thumbnail = undefined // brak pliku → placeholder
    }
  }
}

/** Sprawdza/prosi o uprawnienie do zapisu. */
export async function ensureWritePermission(dir: FileSystemDirectoryHandle): Promise<boolean> {
  const anyDir = dir as any
  if (!anyDir.queryPermission) return true
  const opts = { mode: 'readwrite' as const }
  if ((await anyDir.queryPermission(opts)) === 'granted') return true
  return (await anyDir.requestPermission(opts)) === 'granted'
}
