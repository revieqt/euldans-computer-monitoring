import { app, Menu, BrowserWindow, Tray, powerMonitor, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { exec } from "child_process";
const require$1 = createRequire(import.meta.url);
const activeWin = require$1("active-win");
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let tray = null;
let isQuiting = false;
const IDLE_LIMIT = 300;
const SHUTDOWN_HOUR = 22;
const MEDIA_APPS = [
  "chrome",
  "msedge",
  "vlc",
  "windows media player",
  "youtube",
  "netflix"
];
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault();
      win == null ? void 0 : win.hide();
    }
  });
}
async function getActiveApp() {
  var _a, _b;
  try {
    const w = await activeWin();
    return ((_b = (_a = w == null ? void 0 : w.owner) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) || "";
  } catch {
    return "";
  }
}
function shutdownPC() {
  isQuiting = true;
  exec("shutdown /s /t 0");
}
function showWarning() {
  if (!win) return;
  dialog.showMessageBox(win, {
    type: "warning",
    buttons: ["OK"],
    title: "Shutdown Warning",
    message: "System will shut down due to inactivity or scheduled time."
  });
}
async function shouldShutdown() {
  const idleSeconds = powerMonitor.getSystemIdleTime();
  const activeApp = await getActiveApp();
  const isMediaApp = MEDIA_APPS.some(
    (app2) => activeApp.includes(app2)
  );
  const now = /* @__PURE__ */ new Date();
  const isTimeReached = now.getHours() >= SHUTDOWN_HOUR;
  if (isMediaApp && idleSeconds < 1800) {
    return false;
  }
  if (idleSeconds >= IDLE_LIMIT) {
    return true;
  }
  if (isTimeReached) {
    return true;
  }
  return false;
}
function startMonitor() {
  setInterval(() => {
    if (!win) return;
    const idleSeconds = powerMonitor.getSystemIdleTime();
    win.webContents.send("idle-time", idleSeconds);
  }, 1e3);
  setInterval(async () => {
    if (!win) return;
    const should = await shouldShutdown();
    if (should) {
      showWarning();
      setTimeout(() => {
        shutdownPC();
      }, 1e4);
    }
  }, 5e3);
}
function createTray() {
  tray = new Tray(path.join(process.env.VITE_PUBLIC, "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Client",
      click: () => {
        win == null ? void 0 : win.show();
        win == null ? void 0 : win.focus();
      }
    }
  ]);
  tray.setToolTip("Euldans Client");
  tray.on("click", () => tray == null ? void 0 : tray.popUpContextMenu(contextMenu));
  tray.on("right-click", () => tray == null ? void 0 : tray.popUpContextMenu(contextMenu));
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  createTray();
  win == null ? void 0 : win.hide();
  startMonitor();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
