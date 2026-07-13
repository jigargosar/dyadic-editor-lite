# Backlog

## Pending (2026-07-13) — pre-commit capture

> Everything in this section lives only in the current uncommitted diff + this working session. Captured here so it survives the commit (we won't re-read the diff). Uncommitted files: `src/renderer/src/App.tsx`, `src/renderer/src/CommandPalette.tsx` (new), `src/main/index.ts`, `docs/backlog.md`.

### A. Uncommitted changes — what & why

**`src/main/index.ts` — window show/hide/focus + minimize-to-tray**

- `showAndFocusWindow()`: if minimized `restore()` → `show()` → `focus()`. Order is restore→show→focus, `focus()` last (assumption: on Windows `show()` foregrounds, so `focus()` must come after or it's dropped). Used by tray left-click, tray "Show", `second-instance`, `ready-to-show` (boot), and the toggle's show branch.
- `hideToTray()`: `minimize()` → `hide()`. Invariant: hiding is ALWAYS minimize-then-hide, never a bare hide (minimize hands focus back to the previously-active app; hide then drops us to the tray). Only path that hides.
- `toggleWindowVisibility()` (global hotkey `Shift+Space` only): `if (isVisible() && isFocused()) hideToTray() else showAndFocusWindow()` — so visible-but-**unfocused** → focus (not hide).
- `close` handler: `if (isQuitting) return; preventDefault(); hideToTray()` → X button hides to tray, app stays resident.
- `minimize` handler: native minimize fires *after the fact* (not cancelable) → `hide()`, routing the OS minimize button to the tray too.
- Design rules dictated: minimize+hide are inseparable; always focus an unfocused window; after show → focus; before hide → minimize.

**`src/renderer/src/CommandPalette.tsx` (new) — Ctrl/Cmd+K action picker**

- Additive alongside vim's `:` command line (not a replacement); surfaces each command's vim keybinding as a hint (discoverability).
- Keys: Esc closes, ArrowUp/Down cycles (wraps), Enter runs; row click runs; overlay click closes. Filter change resets the highlight to the top row.

**`src/renderer/src/App.tsx` — the other five features**

- Save-state dot: `dirtyIds` Set + `markDirty`/`markSaved`; amber-400 dot in the tab bar (transparent when saved), tooltip "Unsaved changes pending"/"Saved". `updateListener` marks dirty on edit; 300 ms debounce (`SAVE_DEBOUNCE_MS`) write marks saved. Also flush+markSaved on window `blur`, `beforeunload`, and editor unmount.
- Last-tab no-op close (`closeTabById`): closing the last remaining tab reads the live buffer (`activeContentRef`, since autosave lags); if empty → `return` (no-op); if it has content → delete + open a fresh `Untitled`.
- Tab-in-Ex-mode fix: capture-phase `keydown` on `parentRef` swallows `Tab` when the target is inside `.cm-vim-panel` (the vim `:` input handles only Enter/Esc, so an un-prevented Tab yanked DOM focus to the VIM button).
- Ctrl/Cmd+K handler: capture-phase `keydown` on `window`, toggles `paletteOpen`, wins before CodeMirror/vim. `closePalette` refocuses the editor via `requestAnimationFrame`.
- Tab title width: `min-w-[3rem] max-w-[10rem]` + ellipsis. Placeholder colour: `.cm-placeholder { color: #525252 }` in the editor theme.

### B. Manual test steps (run before trusting; still do them post-commit)

**Command palette**

- [ ] `Ctrl+K` (⌘K on Mac) → palette opens, input focused, all 5 commands listed.
- [ ] Type → list filters by title; highlight resets to the first row.
- [ ] ArrowDown/ArrowUp → highlight moves and wraps at both ends.
- [ ] Enter → runs highlighted command, palette closes.
- [ ] Click a row → runs it, closes. Click the backdrop → closes without running.
- [ ] Esc → closes. `Ctrl+K` while open → closes (toggle). After close → focus back in the editor.
- [ ] Vim `:` still works independently.
- [ ] KNOWN FAIL: Tab inside the palette escapes to the page (focus-trap not built) — backlog bug, expected to fail.

**Tab-in-Ex-mode fix** (vim on)

- [ ] Open the `:` command line, press Tab → focus stays in the command line (does NOT jump to the VIM button).

**Save-state dot**

- [ ] Type in a tab → amber dot appears.
- [ ] Stop ~300 ms → dot clears (saved). Reopen the app → content persisted.
- [ ] Edit then immediately blur the window / close → change is flushed (dot clears, content saved).

**Last-tab no-op close**

- [ ] One empty `Untitled` tab, click × → nothing happens (no-op).
- [ ] One tab WITH content, click × → content cleared, a fresh empty `Untitled` opens.
- [ ] Multiple tabs, close the active one → it's deleted and a neighbour becomes active.

**Tab title width / placeholder**

- [ ] Short ("a") and long titles both sit within min 3rem / max 10rem; long ones ellipsize.
- [ ] Empty editor shows "Start typing." in themed grey (`#525252`), not the library default.

**Window behaviour** (`Shift+Space` live via `pnpm run dev`)

- [ ] Hidden (in tray) → `Shift+Space` → window shows AND is focused.
- [ ] Visible & focused → `Shift+Space` → minimizes + hides to tray.
- [ ] Visible but UNFOCUSED (click another app first) → `Shift+Space` → comes to front + focused (NOT hidden). ← key case.
- [ ] Toggle several cycles → focus is gained reliably on every show. ← the unverified-behaviour risk area.
- [ ] Native minimize button → hides to tray (brief taskbar flash acceptable).
- [ ] Close (X) → hides to tray, app keeps running.
- [ ] Tray left-click → show+focus. Tray menu "Show" → show+focus. Tray menu "Quit" → app actually quits.
- [ ] Launch a 2nd instance while running → existing window shows+focuses, no 2nd window.
- [ ] Fresh boot → window shows + focused.

### C. Caveats / known issues (easy to forget)

- Window runtime behaviour (show-last ordering, restore-then-focus, "minimize degrades focus") is **unverified assumption** — not confirmed by docs or repeat testing. Verify before trusting.
- Minimize button → brief taskbar animation flash (minimize isn't cancelable). Accepted tradeoff.
- Palette: Tab escapes the dialog (focus-trap not implemented) — see the backlog bug below.
- 2 pre-existing eslint `react-hooks/refs` errors at `App.tsx:48–49` (`tabsRef.current = tabs`, `activeTabIdRef.current = activeTabId`) — deliberate stale-closure guard for the one-time `Vim.defineEx` callbacks. `pnpm build` runs typecheck, not eslint, so the build is green despite them.
- Stale header comment `App.tsx:1–5` — says "no tray, no global shortcut, no drag-reorder"; tray + global shortcut both exist since `cbda3c6`.
- Global hotkey is `Shift+Space` (see `SHORTCUT_CANDIDATES` in `main/index.ts`).

### D. Action items

- [ ] Verify Electron `minimize`/`hide`/`show`/`restore`/`focus` behaviour against the official docs (cancelable events vs after-the-fact; what `focus()`/`show()`/`restore()` guarantee on Windows) — before trusting the window code.
- [ ] Run the test set above, then commit (renderer features + window behaviour + these backlog notes).
- [ ] Code-quality baseline — resolve the 2 eslint `react-hooks/refs` errors and decide on lint/format/typecheck gates.
- [ ] Fix the stale `App.tsx:1–5` header comment.
- [ ] **After committing** — capture the behavioural working-agreement (don't assume; admit unknowns; "should I …?" not "let me …"; don't be lazy about checking sources; default = add to backlog) into memory / `CLAUDE.md`. ← this is item "2", scheduled for after the commit.
- [ ] Check off the now-implemented feature items below once committed (tab title width, save indicator, Tab-in-Ex bug, command palette, placeholder styling, last-tab no-op).

## Feature backlog / bugs

- [ ] Tab min/max title size — constrain tab title width (currently `max-w-[180px]` hardcoded in the tab bar) with a sensible min so very short titles ("a", "Untitled") don't look cramped/inconsistent next to long truncated ones.
- [ ] Communicate content saved or pending — no visual indicator today that autosave has happened or is queued (300ms debounce is invisible to the user). Needs a small status cue (e.g. dot/label near the tab or window title) reflecting "saved" vs "unsaved changes pending" state.
- [ ] Bug: Tab key doesn't work in Ex command mode — pressing `Tab` while the `:` command line is open shifts browser-native DOM focus to the next focusable element (the VIM button) instead of being handled inside the command line (e.g. for Ex command completion). Likely the command-line input isn't intercepting/preventDefault-ing Tab before the browser's native tab-order takes over.
- [ ] Consider dropping the bare `:` Ex command interface in favor of a modern command/action picker (Cmd+K-style palette): searchable, shows all available commands and their shortcuts/keybindings at a glance, and easy to register new commands into as the app grows — addresses both the discoverability problem (Ex commands are invisible unless you already know them) and gives a natural home for future actions beyond just tabs.
- [ ] Placeholder styling — the CodeMirror empty-state placeholder ("Start typing.") currently uses the library default styling; needs a pass to match the app's theme (color/opacity/font) instead of default gray.
- [ ] Closing the last tab — current behavior always replaces the last tab with a fresh empty "Untitled" tab regardless of content. Change to: if the last remaining tab is already empty, closing it should be a no-op (disallow/do nothing, since there's nothing to lose and nothing gained by replacing empty with empty); if the last tab has content, closing it should still open a fresh empty tab as it does now.
- [ ] Bug: Tab in the Ctrl/Cmd+K command palette escapes the dialog — Tab should move focus to the next item *within* the palette (focus trap), not shift DOM focus out to the page behind it. Fix by capturing Tab and cycling the selection with the background made `inert`, or by switching the palette to the native `<dialog>` element (which traps focus for free) — whichever works cleanly.
- [ ] Don't represent impossible states — model UI/app state so invalid combinations can't be expressed (prefer discriminated unions / a single source of truth over parallel booleans and nullable pairs). Audit the current state (`ready`/`tabs`/`activeTabId`, `vimEnabled`, `paletteOpen`, `dirtyIds`) for combinations that shouldn't be possible and make them unrepresentable.
- [ ] Map all window states, inputs, and actions as a reference doc — the show/hide/minimize/focus debugging (global-hotkey toggle, tray click/"Show", window close→hide, second-instance, boot) exposed that behavior is being discovered by trial rather than specified. Produce a doc that enumerates every window (and app) state, the inputs/events possible in each (global shortcut, tray interactions, native minimize/close button, second-instance launch, boot), and the resulting action/transition — a state-transition table that serves as the single reference. Complements "don't represent impossible states".
