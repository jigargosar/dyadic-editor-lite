# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Electron desktop app: a tab-based plain-text editor with vim emulation (CodeMirror 6 + `@replit/codemirror-vim`) and plain-file autosave. React 19 renderer, Tailwind v4. Single package, not a monorepo. and pnpm

**Targets Windows only** — no macOS/Linux support intended.

## Commands

- `pnpm dev` — run app (electron-vite dev).
- `pnpm typecheck` — runs both `typecheck:node` and `typecheck:web` (`tsc --noEmit` against separate tsconfigs). Run this to verify changes; `pnpm build` runs it first.
- `pnpm lint` / `pnpm format` — eslint (flat config) / prettier.
- `pnpm gen:icons` — regenerates build/resource icons from mockups.

## Architecture (load-bearing)

- **Process split**: `src/main/index.ts` (Electron main), `src/preload/index.ts` (contextBridge), `src/renderer/src/` (React — `App.tsx` is the core editor, `CommandPalette.tsx`).
- **IPC**: renderer reaches main only via `window.api` (preload contextBridge). All channels namespaced `dyadic:*`, `ipcRenderer.invoke` ↔ `ipcMain.handle`. The `Session` interface is duplicated in `main/index.ts` and `preload/index.d.ts` — keep them in sync manually.
- **Persistence**: plain files under Electron `userData` — `tabs/<id>.txt` per tab + `session.json`, written atomically (temp-file-then-rename). Deliberately **no CRDT, no SQLite**.
- **Autosave**: 300ms debounce (`SAVE_DEBOUNCE_MS`) plus flush on window blur / beforeunload / editor unmount; dirty tracking via a `dirtyIds` Set.
- **Vim tab commands** (`:tabnew`, `:tabclose`, `gt`, etc.) are defined manually via `Vim.defineEx`/`Vim.map` (the library has none) — registered once module-wide, guarded against HMR double-registration.
- **Window/tray (Windows-tuned, subtle)**: single-instance lock; close button and minimize both hide-to-tray (app stays resident, no quit-on-window-all-closed); global hotkeys **Ctrl+Shift+Space** and **Ctrl+Alt+Space**, and tray left-click, all toggle visibility based on `isVisible()` alone (not `isFocused()` — unreliable for tray clicks, which always blur the window before their handler runs); tray right-click opens a menu built fresh each time (label flips Show/Hide); quit only via tray menu (`isQuitting` flag). See `docs/window-states.md` for the intended state machine.

## Conventions

- Path alias `@renderer/*` → `src/renderer/src/*`.
- Milestones: `v1` is the active release; `Icebox` holds wanted-but-unscheduled work.
- Park future ideas in Icebox; pull them into a release when planning.
- Never use `cd` when the current working dir and destination are the same.

## Task tracking

- `docs/board.md`, `docs/icebox.md`, `docs/archive.md`.

## .Backlog - obsolete pending migration

- Never delete backlog files until full migration
