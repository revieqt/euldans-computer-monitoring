import { app, BrowserWindow, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createWindow, setWindow, getWindow } from './window'
import { createTray } from './tray'
import { startMonitor } from './monitor'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// ================= APP =================
app.whenReady().then(() => {
  Menu.setApplicationMenu(null)

  createWindow()
  createTray()
  const win = getWindow()
  win?.hide()

  startMonitor()
})

// ================= EXIT HANDLING =================
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    setWindow(null)
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
