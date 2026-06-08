import { BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let win: BrowserWindow | null = null

export function getWindow() {
  return win
}

export function setWindow(window: BrowserWindow | null) {
  win = window
}

// ================= WINDOW =================
export function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.RENDERER_DIST!, 'index.html'))
  }

  win.on('close', (event) => {
    if (!process.env.IS_QUITING) {
      event.preventDefault()
      win?.hide()
    }
  })
}
