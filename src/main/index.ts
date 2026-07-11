import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'node:fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// A second launch attempt loses the race: quit before anything else in this
// file runs, so it never opens its own window or touches the filesystem.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  let win: BrowserWindow | null = null

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
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
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

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
