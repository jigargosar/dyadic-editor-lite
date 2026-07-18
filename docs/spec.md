# Spec

Goal (what, not how) and constraints, given once, built without checkpoints.

## Locked

- A tab-based plain-text scratchpad for Windows, built with Electron, React 19, TypeScript, Vite, Tailwind, CodeMirror 6, and vim emulation (`@replit/codemirror-vim`), managed with pnpm.

## Locked (coarse) — UI/UX

- You never have to name anything up front — tabs title themselves from what you type.
- It shows only the tabs and the editor.

## Locked (coarse) — Backend

- Saves automatically.
- Closing or crashing always restores exactly what was there.
- Content lives as plain text files on disk.
