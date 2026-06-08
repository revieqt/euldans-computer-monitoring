import { createRequire } from 'node:module'
import { exec } from 'child_process'

const require = createRequire(import.meta.url)
const activeWin = require('active-win')

// ================= ACTIVE WINDOW =================
export async function getActiveApp() {
  try {
    const w = await activeWin()
    return w?.owner?.name?.toLowerCase() || ''
  } catch {
    return ''
  }
}

// ================= SHUTDOWN =================
export function shutdownPC() {
  exec('shutdown /s /t 0')
}
