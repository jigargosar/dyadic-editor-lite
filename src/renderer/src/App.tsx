// Dyadic Lite: tabs + vim + plain-file autosave. No CRDT, no tray, no
// global shortcut, no drag-reorder. Tab shortcuts come from vim itself
// (:tabnew/:tabclose/:tabn/:tabp, gt/gT) via Vim.defineEx/Vim.map — the
// library implements neither natively, so we bind them to our own tab
// functions rather than inventing separate Electron-level keybindings.
import { useEffect, useRef, useState, useCallback } from 'react'
import { Compartment, EditorState, EditorSelection } from '@codemirror/state'
import { EditorView, placeholder } from '@codemirror/view'
import { minimalSetup } from 'codemirror'
import { vim, Vim } from '@replit/codemirror-vim'

const SAVE_DEBOUNCE_MS = 300

interface Tab {
  id: string
  title: string
}

function firstLineTitle(text: string): string {
  const first = text.split('\n', 1)[0].trim()
  return first || 'Untitled'
}

// Registered once, module-wide (Vim.defineEx/Vim.map are global to the vim
// instance, not per-editor) — guarded so re-mounts in dev/HMR don't
// double-register or throw on redefinition.
let vimTabCommandsRegistered = false

export default function App(): React.JSX.Element {
  const [ready, setReady] = useState(false)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [vimEnabled, setVimEnabled] = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const vimCompartmentRef = useRef(new Compartment())
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const activeContentRef = useRef('')

  // Kept current every render so the one-time Vim.defineEx callbacks below
  // never close over stale tabs/activeTabId.
  const tabsRef = useRef<Tab[]>([])
  const activeTabIdRef = useRef<string | null>(null)
  tabsRef.current = tabs
  activeTabIdRef.current = activeTabId

  useEffect(() => {
    let cancelled = false
    async function boot(): Promise<void> {
      const session = await window.api.bootSession()
      if (cancelled) return
      const withTitles = await Promise.all(
        session.tabs.map(async (t) => {
          const content = await window.api.getTabContent(t.id)
          return { id: t.id, title: firstLineTitle(content) }
        })
      )
      setTabs(withTitles)
      setActiveTabId(session.activeTabId)
      setVimEnabled(session.vimEnabled)
      setReady(true)
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const persistSession = useCallback(
    (nextTabs: Tab[], nextActiveId: string, vimOverride?: boolean) => {
      window.api.saveSession({
        tabs: nextTabs.map((t) => ({ id: t.id })),
        activeTabId: nextActiveId,
        vimEnabled: vimOverride ?? vimEnabled
      })
    },
    [vimEnabled]
  )

  const switchTab = useCallback(
    (id: string) => {
      if (id === activeTabIdRef.current) return
      setActiveTabId(id)
      persistSession(tabsRef.current, id)
    },
    [persistSession]
  )

  const newTab = useCallback(async () => {
    const id = 't' + Date.now()
    await window.api.saveTabContent(id, '')
    const nextTabs = [...tabsRef.current, { id, title: 'Untitled' }]
    setTabs(nextTabs)
    persistSession(nextTabs, id)
    setActiveTabId(id)
  }, [persistSession])

  const closeTabById = useCallback(
    async (id: string) => {
      const closingIndex = tabsRef.current.findIndex((t) => t.id === id)
      const remaining = tabsRef.current.filter((t) => t.id !== id)
      await window.api.deleteTab(id)

      if (remaining.length === 0) {
        const freshId = 't' + Date.now()
        await window.api.saveTabContent(freshId, '')
        const freshTabs = [{ id: freshId, title: 'Untitled' }]
        setTabs(freshTabs)
        setActiveTabId(freshId)
        persistSession(freshTabs, freshId)
        return
      }

      setTabs(remaining)
      if (activeTabIdRef.current === id) {
        const next = remaining[Math.max(0, closingIndex - 1)]
        setActiveTabId(next.id)
        persistSession(remaining, next.id)
      } else {
        persistSession(remaining, activeTabIdRef.current as string)
      }
    },
    [persistSession]
  )

  function cycleTab(direction: 1 | -1): void {
    const list = tabsRef.current
    if (list.length < 2) return
    const currentIndex = list.findIndex((t) => t.id === activeTabIdRef.current)
    const nextIndex = (currentIndex + direction + list.length) % list.length
    switchTab(list[nextIndex].id)
  }

  // One-time vim command registration: real vim muscle memory (:tabnew,
  // :tabclose, :tabn, :tabp, gt, gT) wired to our React tab functions,
  // since codemirror-vim implements none of these itself. Note the
  // trailing <CR> on the gt/gT mappings — without it, the mapped ':tabnext'
  // just opens the command line with the text typed but never submitted,
  // leaving it open to swallow whatever you type next.
  useEffect(() => {
    if (vimTabCommandsRegistered) return
    vimTabCommandsRegistered = true

    Vim.defineEx('tabnew', 'tabnew', () => {
      newTab()
    })
    Vim.defineEx('tabclose', 'tabc', () => {
      if (activeTabIdRef.current) closeTabById(activeTabIdRef.current)
    })
    Vim.defineEx('tabnext', 'tabn', () => {
      cycleTab(1)
    })
    Vim.defineEx('tabprevious', 'tabp', () => {
      cycleTab(-1)
    })
    Vim.map('gt', ':tabnext<CR>', 'normal')
    Vim.map('gT', ':tabprevious<CR>', 'normal')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready || !activeTabId || !parentRef.current) return
    let cancelled = false

    async function mount(): Promise<void> {
      const content = await window.api.getTabContent(activeTabId as string)
      if (cancelled) return
      activeContentRef.current = content

      const view = new EditorView({
        parent: parentRef.current as HTMLDivElement,
        state: EditorState.create({
          doc: content,
          extensions: [
            vimCompartmentRef.current.of(vimEnabled ? [vim()] : []),
            minimalSetup,
            EditorView.lineWrapping,
            EditorView.contentAttributes.of({ spellcheck: 'false' }),
            placeholder('Start typing.'),
            EditorView.theme(
              {
                '&': { height: '100%', backgroundColor: 'transparent', color: 'inherit' },
                '.cm-content': { padding: '1rem 1.25rem', caretColor: '#e5e5e5' },
                '.cm-scroller': { fontFamily: 'inherit', lineHeight: '1.6' },
                '&.cm-focused': { outline: 'none' }
              },
              { dark: true }
            ),
            EditorView.updateListener.of((update) => {
              if (!update.docChanged) return
              const text = update.state.doc.toString()
              activeContentRef.current = text
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTabId ? { ...t, title: firstLineTitle(text) } : t))
              )
              clearTimeout(saveTimerRef.current)
              saveTimerRef.current = setTimeout(() => {
                window.api.saveTabContent(activeTabId as string, activeContentRef.current)
              }, SAVE_DEBOUNCE_MS)
            })
          ]
        })
      })
      viewRef.current = view
      view.focus()
    }
    mount()

    return () => {
      cancelled = true
      clearTimeout(saveTimerRef.current)
      if (viewRef.current) {
        window.api.saveTabContent(activeTabId as string, activeContentRef.current)
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeTabId])

  useEffect(() => {
    function flush(): void {
      if (activeTabId) window.api.saveTabContent(activeTabId, activeContentRef.current)
    }
    window.addEventListener('blur', flush)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('blur', flush)
      window.removeEventListener('beforeunload', flush)
    }
  }, [activeTabId])

  function toggleVim(): void {
    const next = !vimEnabled
    const v = viewRef.current
    if (v) {
      v.dispatch({
        effects: vimCompartmentRef.current.reconfigure(next ? [vim()] : []),
        selection: next ? EditorSelection.cursor(v.state.selection.main.head) : undefined
      })
    }
    setVimEnabled(next)
    persistSession(tabsRef.current, activeTabIdRef.current as string, next)
  }

  async function closeTab(id: string, e: React.MouseEvent): Promise<void> {
    e.stopPropagation()
    await closeTabById(id)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-900">
      <div className="flex flex-shrink-0 border-b border-neutral-800 bg-neutral-950">
        {tabs.map((t) => (
          <div
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex max-w-[180px] cursor-pointer items-center gap-2 overflow-hidden border-r border-neutral-800 px-3 py-2 text-[13px] whitespace-nowrap ${
              t.id === activeTabId ? 'bg-neutral-800 text-white' : 'text-neutral-500'
            }`}
          >
            <span className="overflow-hidden text-ellipsis">{t.title}</span>
            <span onClick={(e) => closeTab(t.id, e)} className="opacity-60 hover:opacity-100">
              ×
            </span>
          </div>
        ))}
        <div onClick={newTab} className="cursor-pointer px-3 py-2 text-neutral-500 hover:text-neutral-300">
          +
        </div>
        <div className="ml-auto px-3 py-2">
          <button
            onClick={toggleVim}
            className={`rounded px-2.5 py-1 text-xs text-neutral-200 ${
              vimEnabled ? 'bg-green-800' : 'bg-neutral-800'
            }`}
          >
            VIM {vimEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      <div ref={parentRef} className="min-w-0 flex-1 overflow-auto text-neutral-200" />
    </div>
  )
}
