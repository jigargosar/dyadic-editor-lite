import { app, shell, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import fs from 'node:fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Settled on Shift+Space after probing candidates on this machine — all of
// these registered successfully except the two marked, so any could work,
// but Shift+Space is what we're actually using. Left commented (not
// deleted) as a record of what was tried and confirmed available:
//   ✓ Shift+Space              <- active
//   ✓ Control+Space
//   ✓ Alt+Space
//   ✓ Control+Shift+Space
//   ✓ Control+Alt+Space
//   ✓ Alt+Shift+Space
//   ✗ Super+Space              (register() returned false — already taken)
//   ✗ CommandOrControl+Space   (register() returned false — already taken)
//   ✓ Control+Shift+Alt+Space
const SHORTCUT_CANDIDATES = ['Shift+Space']

// A second launch attempt loses the race: quit before anything else in this
// file runs, so it never opens its own window or touches the filesystem.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  let win: BrowserWindow | null = null
  let tray: Tray | null = null
  let isQuitting = false

  // Used by tray left-click, tray "Show", and second-instance — always
  // brings the window up, never hides it. Launching a second instance or
  // clicking "Show" should never have the surprising effect of hiding.
  function showAndFocusWindow(): void {
    if (!win) return
    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    win.focus()
  }

  // Used only by the global hotkey: toggles instead of always-show, so
  // pressing it again while the window is already up and focused hides it
  // back to tray — the quick-recall pattern (Spotlight/PowerToys Run style)
  // rather than a one-way "always bring to front" action.
  function toggleWindowVisibility(): void {
    if (!win) return
    if (win.isVisible() && win.isFocused()) {
      win.hide()
    } else {
      showAndFocusWindow()
    }
  }

  function createWindow(): void {
    win = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    win.on('ready-to-show', () => {
      win?.show()
    })

    // Minimize-to-tray: closing the window hides it instead of quitting,
    // unless a real quit was requested (tray menu > Quit sets isQuitting).
    win.on('close', (e) => {
      if (isQuitting) return
      e.preventDefault()
      win?.hide()
    })

    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  function createTray(): void {
    tray = new Tray(icon)
    tray.setToolTip('Dyadic')

    // Left-click: always show-and-focus (not the toggle behavior — see
    // showAndFocusWindow's comment above for why this stays one-way).
    tray.on('click', () => {
      showAndFocusWindow()
    })

    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: 'Show', click: () => showAndFocusWindow() },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            isQuitting = true
            app.quit()
          }
        }
      ])
    )
  }

  // For each candidate in SHORTCUT_CANDIDATES: register() can return false
  // (already taken), throw (malformed string), or return true while the OS
  // silently refuses it anyway — so each candidate gets try/catch AND an
  // isRegistered() double-check, not just a trusted boolean. Prints the
  // outcome so failures are visible rather than silent.
  function registerShortcuts(): void {
    const results: { combo: string; ok: boolean; reason?: string }[] = []

    for (const combo of SHORTCUT_CANDIDATES) {
      let registered = false
      try {
        registered = globalShortcut.register(combo, () => {
          toggleWindowVisibility()
        })
      } catch (err) {
        results.push({ combo, ok: false, reason: `threw: ${(err as Error).message}` })
        continue
      }

      if (!registered) {
        results.push({ combo, ok: false, reason: 'register() returned false (likely taken by another app)' })
        continue
      }

      const confirmed = globalShortcut.isRegistered(combo)
      if (!confirmed) {
        results.push({ combo, ok: false, reason: 'register() true but isRegistered() false' })
        globalShortcut.unregister(combo)
        continue
      }

      results.push({ combo, ok: true })
    }

    for (const r of results) {
      console.log(r.ok ? `[shortcut] Registered: ${r.combo}` : `[shortcut] Failed: ${r.combo} — ${r.reason}`)
    }
  }

  // --- Plain-file storage: tabs/<id>.txt + session.json, no CRDT/SQLite. ---
  let tabsDir: string
  let sessionFile: string

  // Write-via-temp-then-rename so a crash mid-write can't corrupt the file;
  // rename is atomic on the same volume.
  async function atomicWrite(filePath: string, content: string): Promise<void> {
    const tmp = filePath + '.tmp'
    await fs.writeFile(tmp, content, 'utf8')
    await fs.rename(tmp, filePath)
  }

  async function ensureDirs(): Promise<void> {
    tabsDir = join(app.getPath('userData'), 'tabs')
    sessionFile = join(app.getPath('userData'), 'session.json')
    await fs.mkdir(tabsDir, { recursive: true })
  }

  interface Session {
    tabs: { id: string }[]
    activeTabId: string
    vimEnabled: boolean
  }

  async function readSession(): Promise<Session | null> {
    try {
      const raw = await fs.readFile(sessionFile, 'utf8')
      const parsed = JSON.parse(raw)
      if (typeof parsed.vimEnabled !== 'boolean') parsed.vimEnabled = false
      return parsed
    } catch {
      return null
    }
  }

  // Fires in this (first) instance when a second launch attempt is blocked
  // by the lock above — focus the existing window instead of ignoring it.
  app.on('second-instance', () => {
    showAndFocusWindow()
  })

  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    await ensureDirs()

    ipcMain.handle('dyadic:bootSession', async () => {
      const session = await readSession()
      if (!session || !session.tabs || session.tabs.length === 0) {
        const id = 't' + Date.now()
        const fresh: Session = { tabs: [{ id }], activeTabId: id, vimEnabled: false }
        await atomicWrite(sessionFile, JSON.stringify(fresh))
        await atomicWrite(join(tabsDir, id + '.txt'), '')
        return fresh
      }
      return session
    })

    ipcMain.handle('dyadic:saveSession', async (_e, session: Session) => {
      await atomicWrite(sessionFile, JSON.stringify(session))
    })

    ipcMain.handle('dyadic:getTabContent', async (_e, id: string) => {
      try {
        return await fs.readFile(join(tabsDir, id + '.txt'), 'utf8')
      } catch {
        return ''
      }
    })

    ipcMain.handle('dyadic:saveTabContent', async (_e, id: string, content: string) => {
      await atomicWrite(join(tabsDir, id + '.txt'), content)
    })

    ipcMain.handle('dyadic:deleteTab', async (_e, id: string) => {
      try {
        await fs.unlink(join(tabsDir, id + '.txt'))
      } catch {
        // already gone; fine
      }
    })

    createWindow()
    createTray()
    registerShortcuts()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })

  app.on('before-quit', () => {
    isQuitting = true
  })

  // No window-all-closed quit: closing the window hides to tray instead
  // (see the 'close' handler above), so the app stays resident until the
  // tray's Quit item (or before-quit) actually sets isQuitting.
}
