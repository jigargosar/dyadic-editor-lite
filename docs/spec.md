# Spec

Goal (what, not how) and constraints, given once, built without checkpoints.

## Locked

- A tab-based plain-text scratchpad for Windows, built with Electron, React 19, TypeScript, Vite, Tailwind, CodeMirror 6, and vim emulation (`@replit/codemirror-vim`), managed with pnpm.

## Locked — Final App

A tab-based plain-text scratchpad for Windows — Electron, React, TypeScript, Vite, Tailwind, CodeMirror 6 with vim emulation, pnpm. It behaves like Notepad's crash-recovery: always saved automatically, nothing ever named up front, closing the app or a crash always restores exactly what was there. Tabs are never truly lost — closing one just takes it out of view, and a history page, like Chrome's, lets you browse and reopen anything from the past. Keyboard shortcuts and a command palette drive everything, with a saving indicator placed at the right UX point. Content lives in a default storage folder, which can be changed.
