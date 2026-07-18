# Spec

Goal (what, not how) and constraints, given once, built without checkpoints.

## Locked

- A tab-based plain-text scratchpad for Windows, built with Electron, React 19, TypeScript, Vite, Tailwind, CodeMirror 6, and vim emulation (`@replit/codemirror-vim`), managed with pnpm.

## Locked — Final App

- A tab-based plain-text scratchpad for Windows, built with Electron, React, TypeScript, Vite, Tailwind, CodeMirror 6, vim emulation, and pnpm.
- Always saved automatically.
- Nothing is ever named up front — tab names come from the first non-whitespace character, defaulting to Untitled when empty.
- Behaves like Notepad's crash-recovery: closing the app or a crash always restores exactly what was there.
- Closing a tab just takes it out of view, never truly lost.
- A history page, like Chrome's, lets you browse and reopen anything from the past.
- Keyboard shortcuts and a command palette drive everything.
- A saving indicator sits at the right UX point.
- Content lives in a default storage folder, which can be changed.
- Single window only, no multi-window support.
- A dockable sidebar, kept out of the way unless opened.
- Ctrl+T reopens the last closed tab.
- Vim emulation is toggleable on/off, not always on.
- Global hotkey and tray icon give quick show/hide access; closing the window minimizes to tray instead of quitting.
- Find/replace works both within the current tab and across all tabs.
- Tabs can be reordered by drag.
- Explicitly out of scope: sync, cloud, multiple devices, a database.
- A proper tray menu.
- Fancy icons used throughout the app.
- Slightly dark theme, fully polished, but yet minimalistic and clean interface.
- Ctrl+Tab jumps to the most-recently-used tab, same as Chrome's Ctrl+Tab behavior.
