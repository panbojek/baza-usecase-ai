# Baza Use-Case AI

Lokalna aplikacja do zarządzania i prezentowania przypadków użycia AI na szkoleniach.
Wpisy trzymane są w plikach Markdown (jak w Obsidianie). Trzy widoki: **siatka**, **lista**
i interaktywny **graf** powiązań (force-directed, przeciąganie węzłów, pan/zoom).

Stack: React + Vite + TypeScript, graf na `react-force-graph-2d`, odczyt/zapis plików
przez File System Access API. Zero backendu, działa lokalnie.

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja otworzy się na `http://127.0.0.1:5173`. Używaj **Chrome** lub **Edge**
(File System Access API nie działa w Firefox/Safari).

## Podłączenie własnej bazy .md

1. Kliknij **📂 Folder .md** w nagłówku.
2. Wskaż folder `baza-usecase-ai/` (z plikami wpisów).
3. Aplikacja wczyta wszystkie `.md`, a nowe wpisy z modala **„+ Nowy wpis"** będzie
   zapisywać jako pliki `.md` w podfolderze kategorii.

Bez wczytanego folderu aplikacja działa na 15 wpisach wbudowanych (podgląd).

## Format wpisu (.md)

```markdown
---
id: osz1
name: Deepfake prezesa na callu
cat: oszustwa                     # roboty | pojazdy | medycyna | oszustwa | wideo
tags: [deepfake, wideo, phishing]
date: 2026-08-03
link: https://example.com/...
thumbnail: thumbnails/osz1.jpg    # opcjonalne
---

Pierwszy akapit = krótki opis na kartach.

Dalej dowolny Markdown = opis rozszerzony w panelu szczegółu.
```

- **Kategorie** — stała lista 5: `roboty`, `pojazdy`, `medycyna`, `oszustwa`, `wideo`.
- **Powiązania w grafie** liczą się automatycznie ze wspólnych tagów — nie zapisujesz ich ręcznie.

## Skróty klawiaturowe

- `/` — kursor w wyszukiwarkę
- `Esc` — zamknij panel szczegółu / modal

## Budowanie wersji produkcyjnej

```bash
npm run build
npm run preview
```

Wynik trafia do `dist/` (statyczne pliki do zahostowania).

## Struktura kodu

```
src/
├─ types.ts                 # model danych
├─ store.tsx                # stan (Context + useReducer) + selektory filtrów
├─ data/                    # kategorie + dane startowe (fallback)
├─ lib/
│  ├─ md.ts                 # parser i serializacja Markdown (frontmatter)
│  ├─ vault.ts              # File System Access API (odczyt/zapis folderu)
│  └─ graph.ts              # krawędzie, stopnie, dane grafu, powiązania
└─ components/              # Header, Sidebar, widoki, DetailPanel, modal
```

## Graf 2D / 3D

Przełącznik **2D / 3D** w lewym górnym rogu grafu:
- **2D** — canvas, przeciąganie węzłów, pan, zoom (jak w Obsidianie).
- **3D** — `react-force-graph-3d` (three.js): przeciągnij = obróć scenę, kółko = zoom,
  prawy przycisk = przesuń. Etykiety jako sprite'y w przestrzeni. Wymaga WebGL2 (Chrome/Edge).
  Kod three.js ładuje się leniwie — dopiero po pierwszym kliknięciu „3D".

## Roadmapa

- **Miniatury** — pole `thumbnail` renderuje realny obraz; wrzucaj pliki do `thumbnails/`.
- **Opakowanie w Tauri** — natywny plik `.exe` z dostępem do folderu bez pytania o zgodę.
