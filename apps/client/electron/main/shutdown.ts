import { dialog, powerMonitor } from 'electron'
import { IDLE_LIMIT, SHUTDOWN_HOUR, MEDIA_APPS } from './config'
import { getActiveApp, shutdownPC } from './utils'
import { getWindow } from './window'

// ================= WARNING =================
export function showWarning() {
  const win = getWindow()
  if (!win) return

  dialog.showMessageBox(win, {
    type: 'warning',
    buttons: ['OK'],
    title: 'Shutdown Warning',
    message: 'System will shut down due to inactivity or scheduled time.'
  })
}

// ================= RULE ENGINE =================
export async function shouldShutdown() {
  const idleSeconds = powerMonitor.getSystemIdleTime()
  const activeApp = await getActiveApp()

  const isMediaApp = MEDIA_APPS.some(app =>
    activeApp.includes(app)
  )

  const now = new Date()
  const isTimeReached = now.getHours() >= SHUTDOWN_HOUR

  // 🎥 If watching video → ignore normal idle shutdown
  if (isMediaApp && idleSeconds < 1800) {
    return false
  }

  // ⏱ idle shutdown
  if (idleSeconds >= IDLE_LIMIT) {
    return true
  }

  // 🕙 scheduled shutdown
  if (isTimeReached) {
    return true
  }

  return false
}
