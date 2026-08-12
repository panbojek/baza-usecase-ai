import type { CatKey, UseCase } from '../types'

/**
 * Minimalny parser frontmattera YAML + treści Markdown.
 * Świadomie bez zależności (gray-matter wymaga polyfilli Buffer w przeglądarce).
 * Obsługuje pola płaskie i listy w formacie `[a, b, c]`.
 */
export function parseMd(text: string, path?: string): UseCase | null {
  const m = text.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/)
  if (!m) return null

  const fm: Record<string, string | string[]> = {}
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.trimEnd()
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    let val: string = line.slice(idx + 1).trim()
    // usuń otaczające cudzysłowy
    const unquote = (s: string) => s.replace(/^['"]|['"]$/g, '')
    if (val.startsWith('[') && val.endsWith(']')) {
      fm[key] = val.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean)
    } else {
      fm[key] = unquote(val)
    }
  }

  const body = (m[2] ?? '').trim()
  const paras = body
    .split(/\r?\n\s*\r?\n/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const str = (v: string | string[] | undefined): string =>
    Array.isArray(v) ? v.join(', ') : (v ?? '')
  const arr = (v: string | string[] | undefined): string[] =>
    Array.isArray(v) ? v : v ? [v] : []

  const name = str(fm.name)
  const cat = str(fm.cat) as CatKey
  if (!name || !cat) return null

  return {
    id: str(fm.id) || slugFallback(name),
    name,
    cat,
    tags: arr(fm.tags),
    date: str(fm.date),
    link: str(fm.link),
    thumbnail: str(fm.thumbnail) || undefined,
    desc: paras[0] ?? '',
    long: paras.slice(1).join('\n\n'),
    path,
  }
}

/** Zamiana wpisu na treść pliku .md (frontmatter + treść). */
export function serializeMd(item: UseCase): string {
  const lines = [
    '---',
    `id: ${item.id}`,
    `name: ${item.name}`,
    `cat: ${item.cat}`,
    `tags: [${item.tags.join(', ')}]`,
    `date: ${item.date}`,
    `link: ${item.link}`,
    `thumbnail:${item.thumbnail ? ' ' + item.thumbnail : ''}`,
    '---',
    '',
    item.desc,
  ]
  if (item.long.trim()) {
    lines.push('', item.long)
  }
  return lines.join('\n') + '\n'
}

function slugFallback(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'uc-' + Math.abs(hash(name))
  )
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

export { slugFallback }
