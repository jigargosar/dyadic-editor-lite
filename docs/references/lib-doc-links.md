# Lib Doc Links — CodeMirror 6 + vim mode

## CodeMirror 6

- https://codemirror.net/docs/ — main docs site: guides + full API reference.
- https://codemirror.net/docs/ref/ — API reference (Compartment, EditorState, EditorView, extensions).
- https://github.com/codemirror/dev — monorepo umbrella repo, links to all individual `@codemirror/*` packages.
- https://www.npmjs.com/package/codemirror — the `codemirror` meta-package (includes `minimalSetup`/`basicSetup`, what we use).
- https://www.npmjs.com/package/@codemirror/state — `EditorState`, `Compartment`, `EditorSelection`.
- https://www.npmjs.com/package/@codemirror/view — `EditorView`, `keymap`, `placeholder`, theming.

## @replit/codemirror-vim

- https://github.com/replit/codemirror-vim — source repo + README (install, basic setup, `Vim`/`getCM` API examples).
- https://replit-codemirror-vim.mintlify.app/ — hosted docs site; has the Key Mappings guide (`Vim.map`/`Vim.unmap`, `<Leader>` notation, special-key notation like `<CR>`/`<Esc>`/`<C-x>`).
- https://www.npmjs.com/package/@replit/codemirror-vim — package page, version history.
- https://github.com/replit/codemirror-vim/blob/master/src/vim.js — actual source; `defaultKeymap` and `defaultExCommandMap` at the top are the ground truth for what's implemented vs. not (this is where we confirmed no native `:tabnew`/`gt` support).
- https://github.com/replit/codemirror-vim/issues — issue tracker, useful for checking if something's a known gap.

## Notes worth keeping next to these links

- `Vim.map`/`Vim.defineEx` are global to the shared `Vim` singleton, not per-`EditorView` — register once, not per-editor-mount.
- Any `Vim.map` target that runs an Ex command needs a trailing `<CR>` (e.g. `':tabnext<CR>'`), or it just opens the command line with the text typed and never executes it.
- Vim mode toggling live (no editor teardown) goes through a `Compartment`: `compartment.of(enabled ? [vim()] : [])`, then `view.dispatch({ effects: compartment.reconfigure(...) })`.
