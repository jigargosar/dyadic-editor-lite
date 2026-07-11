import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  bootSession: () => ipcRenderer.invoke('dyadic:bootSession'),
  saveSession: (session: unknown) => ipcRenderer.invoke('dyadic:saveSession', session),
  getTabContent: (id: string) => ipcRenderer.invoke('dyadic:getTabContent', id),
  saveTabContent: (id: string, content: string) =>
    ipcRenderer.invoke('dyadic:saveTabContent', id, content),
  deleteTab: (id: string) => ipcRenderer.invoke('dyadic:deleteTab', id)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
