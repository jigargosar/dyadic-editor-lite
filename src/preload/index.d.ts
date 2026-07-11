import { ElectronAPI } from '@electron-toolkit/preload'

interface Session {
  tabs: { id: string }[]
  activeTabId: string
  vimEnabled: boolean
}

interface DyadicAPI {
  bootSession: () => Promise<Session>
  saveSession: (session: Session) => Promise<void>
  getTabContent: (id: string) => Promise<string>
  saveTabContent: (id: string, content: string) => Promise<void>
  deleteTab: (id: string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DyadicAPI
  }
}
