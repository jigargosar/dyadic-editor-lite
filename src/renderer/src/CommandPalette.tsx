// Cmd+K-style action picker. Deliberately additive: it sits alongside vim's
// native `:` command line (which vim users expect) rather than replacing it,
// and surfaces each command's vim keybinding as a hint so the otherwise
// invisible Ex commands become discoverable.
import { useEffect, useRef, useState } from 'react'

export interface Command {
  id: string
  title: string
  hint?: string
  run: () => void
}

export function CommandPalette({
  commands,
  onClose
}: {
  commands: Command[]
  onClose: () => void
}): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const needle = query.trim().toLowerCase()
  const filtered = needle
    ? commands.filter((c) => c.title.toLowerCase().includes(needle))
    : commands

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function onQueryChange(value: string): void {
    // Reset the highlight to the top on every filter change — keeps `selected`
    // trivially in range (the list only ever changes via the query) without a
    // clamp-in-effect.
    setQuery(value)
    setSelected(0)
  }

  function runAt(index: number): void {
    const cmd = filtered[index]
    if (!cmd) return
    cmd.run()
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runAt(selected)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-[32rem] max-w-[90vw] overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a command…"
          spellCheck={false}
          className="w-full border-b border-neutral-800 bg-transparent px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
        />
        <div className="max-h-72 overflow-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500">No matching commands</div>
          ) : (
            filtered.map((c, i) => (
              <div
                key={c.id}
                onClick={() => runAt(i)}
                onMouseMove={() => setSelected(i)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm ${
                  i === selected ? 'bg-neutral-800 text-white' : 'text-neutral-300'
                }`}
              >
                <span>{c.title}</span>
                {c.hint && (
                  <span className="ml-4 rounded bg-neutral-700/60 px-1.5 py-0.5 font-mono text-[11px] text-neutral-400">
                    {c.hint}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
