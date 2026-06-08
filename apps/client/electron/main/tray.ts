import { Tray, Menu } from 'electron'
import path from 'node:path'
import { getWindow } from './window'

let tray: Tray | null = null

// ================= TRAY =================
export function createTray() {
  tray = new Tray(path.join(process.env.VITE_PUBLIC!, 'icon.png'))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Client',
      click: () => {
        const win = getWindow()
        win?.show()
        win?.focus()
      }
    },
  ])

  tray.setToolTip('Euldans Client')

  tray.on('click', () => tray?.popUpContextMenu(contextMenu))
  tray.on('right-click', () => tray?.popUpContextMenu(contextMenu))
}
