# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Electron desktop app: a tab-based plain-text editor with vim emulation (CodeMirror 6 + `@replit/codemirror-vim`) and plain-file autosave. React 19 renderer, Tailwind v4. Single package, not a monorepo.

**Targets Windows only** — no macOS/Linux support intended.

## Commands

Use **pnpm** (only `pnpm-lock.yaml` exists). Scripts call `npm run ...` internally, but install/run via pnpm.

- `pnpm dev` — run app (electron-vite dev).
- `pnpm typecheck` — runs both `typecheck:node` and `typecheck:web` (`tsc --noEmit` against separate tsconfigs). Run this to verify changes; `pnpm build` runs it first.
- `pnpm lint` / `pnpm format` — eslint (flat config) / prettier.
- `pnpm gen:icons` — regenerates build/resource icons from mockups.

There is **no test framework and no CI** — verify changes with `typecheck` and by running the app.

## Architecture (load-bearing)

- **Process split**: `src/main/index.ts` (Electron main), `src/preload/index.ts` (contextBridge), `src/renderer/src/` (React — `App.tsx` is the core editor, `CommandPalette.tsx`).
- **IPC**: renderer reaches main only via `window.api` (preload contextBridge). All channels namespaced `dyadic:*`, `ipcRenderer.invoke` ↔ `ipcMain.handle`. The `Session` interface is duplicated in `main/index.ts` and `preload/index.d.ts` — keep them in sync manually.
- **Persistence**: plain files under Electron `userData` — `tabs/<id>.txt` per tab + `session.json`, written atomically (temp-file-then-rename). Deliberately **no CRDT, no SQLite**.
- **Autosave**: 300ms debounce (`SAVE_DEBOUNCE_MS`) plus flush on window blur / beforeunload / editor unmount; dirty tracking via a `dirtyIds` Set.
- **Vim tab commands** (`:tabnew`, `:tabclose`, `gt`, etc.) are defined manually via `Vim.defineEx`/`Vim.map` (the library has none) — registered once module-wide, guarded against HMR double-registration.
- **Window/tray (Windows-tuned, subtle)**: single-instance lock; close button and minimize both hide-to-tray (app stays resident, no quit-on-window-all-closed); global hotkey **Shift+Space** toggles visibility; show sequence must be restore→show→focus (focus last, for Windows); quit only via tray menu (`isQuitting` flag). See `docs/window-states.md` for the intended state machine.

## Conventions

- Path alias `@renderer/*` → `src/renderer/src/*`.
- `docs/front-log.md` is a running dev changelog (narrative, not a spec) — update it when capturing notable changes.
