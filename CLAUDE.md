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

Recommended editor: **VSCode** with the **ESLint** and **Prettier** extensions.

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
- Milestones: `v1` is the active release; `Icebox` holds wanted-but-unscheduled work. 
- Park future ideas in Icebox; pull them into a release when planning.
- Assign milestones by exact existing name — a typo creates an unremovable phantom.
- Never use `cd` when the current working dir and destination are the same.

## Backlog

- Never delete backlog files — it breaks referential integrity. Archive instead (`backlog task archive`).
- Assign milestones by exact existing name — a typo creates a phantom.
- Auto-generated instructions below — do not edit inside; add rules here.

<!-- BACKLOG.MD GUIDELINES START -->
<!-- backlog.md-instructions-version: 1.48.0 -->
<CRITICAL_INSTRUCTION>

## Backlog.md Workflow

This project uses Backlog.md for task and project management.

**For every user request in this project, run `backlog instructions overview` before answering or taking action.**

Use the overview to decide whether to search, read, create, or update Backlog tasks.

Before task lifecycle actions, read the matching detailed guide:
- `backlog instructions task-creation` before creating or splitting tasks
- `backlog instructions task-execution` before planning, changing status or assignee, adding a plan or implementation notes, or implementing task work
- `backlog instructions task-finalization` before checking acceptance criteria, writing final summaries, or moving tasks to terminal statuses

Use `backlog <command> --help` before running unfamiliar commands. Help shows options, fields, and examples.

Do not edit Backlog task, draft, document, decision, or milestone markdown files directly. Use the `backlog` CLI so metadata, relationships, and history stay consistent.


</CRITICAL_INSTRUCTION>
<!-- BACKLOG.MD GUIDELINES END -->
