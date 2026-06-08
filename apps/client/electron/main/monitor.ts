import { powerMonitor } from 'electron'
import { shouldShutdown, showWarning } from './shutdown'
import { getWindow } from './window'
import { shutdownPC } from './utils'

// ================= MONITOR LOOP =================
export function startMonitor() {
  // Send idle time to renderer every second
  setInterval(() => {
    const win = getWindow()
    if (!win) return
    const idleSeconds = powerMonitor.getSystemIdleTime()
    win.webContents.send('idle-time', idleSeconds)
  }, 1000)

  // Check for shutdown every 5 seconds
  setInterval(async () => {
    const win = getWindow()
    if (!win) return

    const should = await shouldShutdown()

    if (should) {
      showWarning()

      setTimeout(() => {
        process.env.IS_QUITING = 'true'
        shutdownPC()
      }, 10000)
    }
  }, 5000)
}
